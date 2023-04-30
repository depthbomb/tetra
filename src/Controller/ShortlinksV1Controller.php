<?php namespace App\Controller;

use Exception;
use DateTimeImmutable;
use App\Entity\Shortlink;
use App\Service\QrService;
use App\Service\FormatService;
use App\Attribute\RateLimited;
use App\Repository\UserRepository;
use App\Repository\ShortlinkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[RateLimited('public_api')]
#[Route('/api/v1/shortlinks')]
class ShortlinksV1Controller extends BaseController
{
    public function __construct(
        private readonly ShortlinkRepository    $shortlinks,
        private readonly EntityManagerInterface $manager,
        private readonly FormatService          $format,
        private readonly UserRepository         $users,
    ) {}

    #[Route('/{shortcode}', name: 'shortlink_info_v1', methods: 'GET', stateless: true)]
    public function getShortlinkInfo(string $shortcode): Response
    {
        $shortlink = $this->shortlinks->findOneByShortcode($shortcode);

        $this->abortIf(!$shortlink, 404);

        $destination = $shortlink->getDestination();
        $expires_at  = $shortlink->getExpiresAt();

        return $this->format->formatData(compact('destination', 'expires_at'));
    }

    #[Route('', name: 'shortlink_user_list_v1', methods: 'GET', stateless: true)]
    public function getUserShortlinks(Request $request): Response
    {
        $query   = $request->query;
        $api_key = $query->get('api_key');

        $this->abortUnless($api_key, 400, 'Missing api_key');

        $user = $this->users->findOneByApiKey($api_key);

        $this->abortUnless(!!$user, 400, 'Invalid api_key');

        $shortlinks = $this->shortlinks->createQueryBuilder('s')
            ->select('s.shortcode, s.shortlink, s.destination, s.secret, s.expires_at, s.created_at')
            ->leftJoin('s.creator', 'c')
            ->where('c.id = :id')
            ->setParameter('id', $user->getId())
            ->orderBy('s.created_at', 'ASC')
            ->getQuery()
            ->getArrayResult();

        return $this->format->formatData($shortlinks);
    }

    #[Route('', name: 'shortlink_create_v1', methods: 'PUT')]
    public function createShortlink(Request $request): Response
    {
        $query = $request->query;
        $form  = $request->request;

        // Validate `destination`

        $destination = $form->get('destination');
        $this->abortIf(!$destination, 400, 'A destination is required');

        // Process `duration` into an `expires_at` date

        $expires_at = null;
        if ($form->has('duration'))
        {
            $duration   = $form->get('duration');
            if ($duration !== '')
            {
                $expires_at = $this->getExpiresAtFromDuration($duration);
            }
        }

        // Validate `shortcode`

        if ($form->get('shortcode'))
        {
            $shortcode = $form->get('shortcode');

            $this->abortIf(preg_match("/[a-zA-Z0-9_-]{3,255}/", $shortcode) !== 1, 400, 'Custom shortcode must be between 3 and 255 characters, and can only contain A-Z, 0-9, - and _ characters');
            $this->abortIf($this->shortlinks->findOneByShortcode($shortcode) !== null, 400, 'Shortcode is taken');
        }
        else
        {
            $shortcode = $this->shortlinks->getUnusedShortcode();
        }

        // Creator retrieval

        $api_key = $query->get('api_key');

        $user = null;
        if ($api_key)
        {
            $user = $this->users->findOneByApiKey($api_key);
            $this->abortUnless(!!$user, 400, 'Invalid api_key');
        }

        // Create the shortlink object

        $shortlink = $this->generateUrl('shortlink_redirect', compact('shortcode'), UrlGeneratorInterface::ABSOLUTE_URL);

        $new_shortlink = new Shortlink;
        $new_shortlink->setCreatorIp($request->getClientIp());
        $new_shortlink->setShortcode($shortcode);
        $new_shortlink->setShortlink($shortlink);
        $new_shortlink->setDestination($destination);

        if ($expires_at)
        {
            $new_shortlink->setExpiresAt($expires_at);
        }

        if ($user)
        {
            $user->addShortlink($new_shortlink);
            $this->manager->persist($user);
        }

        $this->manager->persist($new_shortlink);
        $this->manager->flush();

        return $this->format->formatData([
            'shortcode'   => $shortcode,
            'shortlink'   => $shortlink,
            'destination' => $destination,
            'secret'      => $new_shortlink->getSecret(),
            'expires_at'  => $expires_at?->format('c'),
        ], 201);
    }

    #[Route('/{shortcode}/{secret}', name: 'shortlink_delete_v1', methods: 'DELETE')]
    public function deleteShortlink(string $shortcode, string $secret): Response
    {
        $this->shortlinks->delete($shortcode, $secret);

        return $this->format->formatData([]);
    }

    #[Route('/{shortcode}/{secret}/set-expiry', name: 'shortlink_set_expiry_v1', methods: 'PATCH')]
    public function setShortlinkExpiry(Request $request, string $shortcode, string $secret): Response
    {
        $form = $request->request;

        $this->abortUnless($form->has('duration'), 400, 'A duration is required');

        $duration   = $form->get('duration');
        $expires_at = $this->getExpiresAtFromDuration($duration);

        /** @var ?Shortlink $shortlink */
        $shortlink = $this->shortlinks->createQueryBuilder('s')
            ->where('s.shortcode = :shortcode')
            ->setParameter('shortcode', $shortcode)
            ->andWhere('s.secret = :secret')
            ->setParameter('secret', $secret)
            ->andWhere('s.disabled = false')
            ->getQuery()
            ->getOneOrNullResult();

        $this->abortUnless(!!$shortlink, 404);

        $shortlink->setExpiresAt($expires_at);

        $this->shortlinks->save($shortlink, true);

        return $this->format->formatData(['expires_at' => $expires_at->format('c')]);
    }

    #[Route('/{shortcode}/qr-code', name: 'shortlink_qr_code_v1', methods: 'GET')]
    public function getQrCode(QrService $qr, string $shortcode): Response
    {
        $shortlink = $this->shortlinks->createQueryBuilder('s')
            ->select('s.shortlink')
            ->where('s.shortcode = :shortcode')
            ->andWhere('s.disabled = false')
            ->setParameter('shortcode', $shortcode)
            ->getQuery()
            ->getSingleScalarResult();

        $this->abortUnless(!!$shortlink, 404);

        $svg = $qr->generateQrCode($shortlink);

        return new Response($svg, headers: ['Content-Type' => 'image/svg+xml']);
    }

    private function getExpiresAtFromDuration(string $duration): DateTimeImmutable
    {
        $expires_at = null;
        try
        {
            $now        = new DateTimeImmutable();
            $duration   = str_replace(['+', '-'], ['', ''], $duration);
            $expires_at = $now->modify($duration);
        }
        catch (Exception)
        {
            $this->abort(400, 'Invalid duration provided');
        }

        // Check if the requested expires_at is in the past
        $this->abortIf($expires_at <= $now, 400, 'The provided duration must result in a future date');
        // Check if the requested expires_at is at least 5 minutes into the future
        // Note: add a few more seconds as a buffer for potential slower requests
        $this->abortIf($expires_at->modify('-5 minutes 5 seconds') < $now, 400, 'The minimum duration is 5 minutes');

        return $expires_at;
    }
}

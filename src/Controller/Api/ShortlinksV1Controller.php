<?php namespace App\Controller\Api;

use DateTimeImmutable;
use App\Util\Killswitch;
use App\Entity\Shortlink;
use App\Service\QrService;
use App\Service\FormatService;
use App\Attribute\RateLimited;
use App\Repository\UserRepository;
use App\Controller\BaseController;
use App\Repository\ShortlinkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[RateLimited('public_api')]
#[Route('/api/v1/shortlinks')]
class ShortlinksV1Controller extends BaseController
{
    public function __construct(
        private readonly TranslatorInterface    $translator,
        private readonly ShortlinkRepository    $shortlinks,
        private readonly EntityManagerInterface $manager,
        private readonly FormatService          $format,
        private readonly UserRepository         $users,
    ) {}

    #[Route('/{shortcode}', name: 'shortlink_info_v1', methods: ['GET'], stateless: true)]
    public function getShortlinkInfo(string $shortcode): Response
    {
        $shortlink = $this->shortlinks->createQueryBuilder('s')
            ->select('s.shortlink, s.destination, s.expires_at, s.created_at')
            ->where('s.shortcode = :shortcode')
            ->setParameter('shortcode', $shortcode)
            ->andWhere('s.disabled = false')
            ->getQuery()
            ->getOneOrNullResult();

        $this->abortUnless(!!$shortlink, 404);

        return $this->format->createFormattedResponse($shortlink);
    }

    #[Route('', name: 'shortlink_user_list_v1', methods: ['GET'], stateless: true)]
    public function getUserShortlinks(Request $request): Response
    {
        $query   = $request->query;
        $api_key = $query->get('api_key');

        $this->abortUnless($api_key, 400, $this->translator->trans('error.api_key.missing'));

        $user = $this->users->findOneByApiKey($api_key);

        $this->abortUnless(!!$user, 400, $this->translator->trans('error.api_key.invalid'));

        $shortlinks = $this->shortlinks->createQueryBuilder('s')
            ->select('s.shortcode, s.shortlink, s.destination, s.secret, s.expires_at, s.created_at')
            ->leftJoin('s.creator', 'c')
            ->where('c.id = :id')
            ->setParameter('id', $user->getId())
            ->andWhere('s.disabled = false')
            ->orderBy('s.created_at', 'DESC')
            ->getQuery()
            ->getArrayResult();

        return $this->format->createFormattedResponse($shortlinks);
    }

    #[Route('', name: 'shortlink_create_v1', methods: ['PUT'])]
    public function createShortlink(Request $request): Response
    {
        $this->abortUnless(
            Killswitch::isEnabled(Killswitch::SHORTLINK_CREATION_ENABLED),
            Response::HTTP_BAD_GATEWAY,
            'Shortlink creation is temporarily disabled'
        );

        $query   = $request->query;
        $payload = $request->getPayload();

        // Validate `destination`
        $destination = $payload->get('destination');
        $this->abortIf(!$destination, 400, $this->translator->trans('error.shortlinks.destination.missing'));

        // Retrieve the creator from the provided API key
        $api_key = $query->get('api_key');
        $user    = null;
        if ($api_key)
        {
            $user = $this->users->findOneByApiKey($api_key);
            $this->abortUnless(!!$user, 400, $this->translator->trans('error.api_key.invalid'));
        }

        // Process `duration` into an `expires_at` date
        $expires_at = null;
        if ($payload->has('duration'))
        {
            $duration = $payload->get('duration');
            if (!empty($duration))
            {
                $expires_at = $this->getExpiresAtFromDuration($duration);
            }
        }

        // Validate `shortcode`
        if ($payload->get('shortcode'))
        {
            $shortcode = $payload->get('shortcode');
            $this->abortIf(preg_match("/[a-zA-Z0-9_-]{3,255}/", $shortcode) !== 1, 400, $this->translator->trans('error.shortlinks.shortcode.invalid'));
            $this->abortIf($this->shortlinks->findOneByShortcode($shortcode) !== null, 400, $this->translator->trans('error.shortlinks.shortcode.unavailable'));
        }
        else
        {
            // Fall back to generating a random unused shortcode
            $shortcode = $this->shortlinks->getUnusedShortcode();
        }

        $shortlink = $this->generateUrl('shortlink_redirect', compact('shortcode'), UrlGeneratorInterface::ABSOLUTE_URL);

        // Create the shortlink object

        $new_shortlink = new Shortlink;
        $new_shortlink->setCreatorIp($request->getClientIp());
        $new_shortlink->setShortcode($shortcode);
        $new_shortlink->setShortlink($shortlink);
        $new_shortlink->setDestination($destination);

        if (!is_null($expires_at))
        {
            $new_shortlink->setExpiresAt($expires_at);
        }

        if (!is_null($user))
        {
            $user->addShortlink($new_shortlink);
            $this->manager->persist($user);
        }

        $this->manager->persist($new_shortlink);
        $this->manager->flush();

        return $this->format->createFormattedResponse([
            'shortcode'   => $shortcode,
            'shortlink'   => $shortlink,
            'destination' => $destination,
            'secret'      => $new_shortlink->getSecret(),
            'expires_at'  => $new_shortlink->getExpiresAt(),
        ], 201);
    }

    #[Route('/{shortcode}/{secret}', name: 'shortlink_delete_v1', methods: ['DELETE'])]
    public function deleteShortlink(string $shortcode, string $secret): Response
    {
        $this->shortlinks->delete($shortcode, $secret);

        return $this->format->createFormattedResponse([]);
    }

    #[Route('/{shortcode}/{secret}/set-expiry', name: 'shortlink_set_expiry_v1', methods: ['PATCH'])]
    public function setShortlinkExpiry(Request $request, string $shortcode, string $secret): Response
    {
        $payload = $request->getPayload();

        $this->abortUnless($payload->has('duration'), 400, $this->translator->trans('error.shortlinks.duration.missing'));

        $duration   = $payload->get('duration');
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

        return $this->format->createFormattedResponse(['expires_at' => $expires_at->format('c')]);
    }

    #[Route('/{shortcode}/qr-code', name: 'shortlink_qr_code_v1', methods: ['GET'], stateless: true)]
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

    #[Route('/{shortcode}/availability', name: 'shortlink_shortcode_availability_v1', methods: ['GET'], stateless: true)]
    public function getShortcodeAvailability(string $shortcode): Response
    {
        $available = $this->shortlinks->count(['shortcode' => $shortcode]) === 0;

        return $this->format->createFormattedResponse(compact('available'));
    }

    private function getExpiresAtFromDuration(string $duration): DateTimeImmutable
    {
        $now        = date_create_immutable();
        $duration   = str_replace(['+', '-'], ['', ''], $duration);
        $expires_at = date_create_immutable($duration);

        $this->abortUnless($expires_at !== false, 400, $this->translator->trans('error.shortlinks.duration.invalid'));

        // Check if the requested expires_at is in the past
        $this->abortIf($expires_at <= $now, 400, $this->translator->trans('error.shortlinks.duration.past_or_present'));

        // Check if the requested expires_at is at least 5 minutes into the future
        $this->abortIf($expires_at->modify('-5 minutes') < $now, 400, $this->translator->trans('error.shortlinks.duration.too_short'));

        return $expires_at;
    }
}

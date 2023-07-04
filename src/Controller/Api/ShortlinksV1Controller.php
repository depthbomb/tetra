<?php namespace App\Controller\Api;

use DateTimeImmutable;
use App\Util\Features;
use App\Entity\Shortlink;
use App\Service\QrService;
use App\Controller\Controller;
use App\Service\FormatService;
use App\Attribute\RateLimited;
use App\Repository\UserRepository;
use App\Repository\ShortlinkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Doctrine\Types\UlidType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[RateLimited('public_api')]
#[Route('/api/v1/shortlinks')]
class ShortlinksV1Controller extends Controller
{
    public function __construct(
        private readonly TranslatorInterface    $translator,
        private readonly ShortlinkRepository    $shortlinks,
        private readonly EntityManagerInterface $manager,
        private readonly FormatService          $format,
        private readonly UserRepository         $users,
    ) {}

    #[Route('/{shortcode}', name: 'api.v1.shortlinks.info', methods: ['GET'])]
    public function getShortlinkInfo(string $shortcode): Response
    {
        $shortlink = $this->shortlinks->createQueryBuilder('s')
            ->select('s.shortlink, s.destination, s.expires_at, s.created_at')
            ->where('s.shortcode = :shortcode')
            ->setParameter('shortcode', $shortcode)
            ->andWhere('s.disabled = false')
            ->getQuery()
            ->getOneOrNullResult();

        $this->abortUnless(!!$shortlink, Response::HTTP_NOT_FOUND);

        return $this->format->createFormattedResponse($shortlink);
    }

    #[Route('', name: 'api.v1.shortlinks.user_shortlinks', methods: ['GET'])]
    public function getUserShortlinks(Request $request): Response
    {
        $query   = $request->query;
        $api_key = $query->getString('api_key');

        $this->abortUnless($api_key, Response::HTTP_BAD_REQUEST, $this->translator->trans('error.api_key.missing'));

        $user = $this->users->findOneByApiKey($api_key);

        $this->abortUnless(!!$user, Response::HTTP_BAD_REQUEST, $this->translator->trans('error.api_key.invalid'));

        $shortlinks = $this->shortlinks->createQueryBuilder('s')
            ->select('s.shortcode, s.shortlink, s.destination, s.secret, s.expires_at, s.created_at')
            ->leftJoin('s.creator', 'c')
            ->leftJoin('s.hits', 'h')
            ->addSelect('COUNT(h.id) as hits')
            ->where('c.id = :id')
            ->setParameter('id', $user->getId(), UlidType::NAME)
            ->andWhere('s.disabled = false')
            ->orderBy('s.created_at', 'DESC')
            ->groupBy('s.id')
            ->getQuery()
            ->getArrayResult();

        return $this->format->createFormattedResponse($shortlinks);
    }

    #[Route('', name: 'api.v1.shortlinks.create', methods: ['PUT'])]
    public function createShortlink(Request $request): Response
    {
        $this->requireFeature('SHORTLINK_CREATION', $this->translator->trans('error.shortlink.creation_feature_disabled'));

        $query   = $request->query;
        $payload = $request->getPayload();

        // Validate `destination`
        $destination = $payload->getString('destination');
        $this->abortIf(!$destination, Response::HTTP_BAD_REQUEST, $this->translator->trans('error.shortlink.destination.missing'));

        // Retrieve the creator from the provided API key
        $api_key = $query->getString('api_key');
        $user    = null;
        if ($api_key)
        {
            $user = $this->users->findOneByApiKey($api_key);
            $this->abortUnless(!!$user, Response::HTTP_BAD_REQUEST, $this->translator->trans('error.api_key.invalid'));
        }

        // Process `duration` into an `expires_at` date
        $expires_at = null;
        if ($duration = $payload->getString('duration'))
        {
            $expires_at = $this->getExpiresAtFromDuration($duration);
        }

        // Validate `shortcode`
        if ($shortcode = $payload->getString('shortcode'))
        {
            $this->abortIf(
                preg_match("/[a-zA-Z0-9_-]{3,255}/", $shortcode) !== 1,
                Response::HTTP_BAD_REQUEST,
                $this->translator->trans('error.shortlink.shortcode.invalid')
            );

            $this->abortUnless(
                $this->shortlinks->count(['shortcode' => $shortcode]) === 0,
                Response::HTTP_BAD_REQUEST,
                $this->translator->trans('error.shortlink.shortcode.unavailable')
            );
        }
        else
        {
            // Fall back to generating a random unused shortcode
            $shortcode = $this->shortlinks->getUnusedShortcode();
        }

        $shortlink = $this->generateUrl('web.shortlink_redirect', compact('shortcode'), UrlGeneratorInterface::ABSOLUTE_URL);

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
        ], Response::HTTP_CREATED);
    }

    #[Route('/{shortcode}/{secret}', name: 'api.v1.shortlinks.delete', methods: ['DELETE'])]
    public function deleteShortlink(string $shortcode, string $secret): Response
    {
        $this->shortlinks->delete($shortcode, $secret);

        return $this->format->createFormattedResponse([]);
    }

    #[Route('/{shortcode}/{secret}/set-expiry', name: 'api.v1.shortlinks.set_expiry', methods: ['PATCH'])]
    public function setShortlinkExpiry(Request $request, string $shortcode, string $secret): Response
    {
        $payload = $request->getPayload();

        $this->abortUnless(
            $payload->has('duration'),
            Response::HTTP_BAD_REQUEST,
            $this->translator->trans('error.shortlink.duration.missing')
        );

        $duration   = $payload->getString('duration');
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

        $this->abortUnless(!!$shortlink, Response::HTTP_NOT_FOUND);

        $shortlink->setExpiresAt($expires_at);

        $this->shortlinks->save($shortlink, true);

        return $this->format->createFormattedResponse(['expires_at' => $expires_at->format('c')]);
    }

    #[Route('/{shortcode}/qr-code', name: 'api.v1.shortlinks.qr_code', methods: ['GET'])]
    public function getQrCode(QrService $qr, string $shortcode): Response
    {
        $shortlink = $this->shortlinks->createQueryBuilder('s')
            ->select('s.shortlink')
            ->where('s.shortcode = :shortcode')
            ->andWhere('s.disabled = false')
            ->setParameter('shortcode', $shortcode)
            ->getQuery()
            ->getSingleScalarResult();

        $this->abortUnless(!!$shortlink, Response::HTTP_NOT_FOUND);

        $svg = $qr->generateQrCode($shortlink);

        return new Response($svg, headers: ['Content-Type' => 'image/svg+xml']);
    }

    #[Route('/{shortcode}/availability', name: 'api.v1.shortlinks.shortcode_availability', methods: ['GET'])]
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

        $this->abortUnless(
            $expires_at !== false,
            Response::HTTP_BAD_REQUEST,
            $this->translator->trans('error.shortlink.duration.invalid')
        );

        // Check if the duration is in the past
        $this->abortIf($expires_at <= $now,
            Response::HTTP_BAD_REQUEST,
            $this->translator->trans('error.shortlink.duration.past_or_present')
        );

        // Check if the duration is at least 5 minutes into the future
        $this->abortIf($expires_at->modify('-5 minutes') < $now,
            Response::HTTP_BAD_REQUEST,
            $this->translator->trans('error.shortlink.duration.too_short')
        );

        return $expires_at;
    }
}

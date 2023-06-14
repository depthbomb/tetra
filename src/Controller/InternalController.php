<?php namespace App\Controller;

use App\Entity\Shortlink;
use App\Repository\ShortlinkRepository;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Depthbomb\CsrfBundle\Attribute\CsrfProtected;
use Symfony\Contracts\Translation\TranslatorInterface;

#[Route('/api')]
#[CsrfProtected('ajax')]
class InternalController extends BaseController
{
    public function __construct(
        private readonly TranslatorInterface $translator,
        private readonly ShortlinkRepository $shortlinks,
        private readonly CacheInterface      $cache,
    ) {}

    #[Route('/total-shortlinks', name: 'internal_total_shortlinks', methods: ['POST'])]
    public function getTotalShortlinks(): Response
    {
        $count = $this->cache->get('total_shortlinks', function (ItemInterface $item) {
            $item->expiresAfter(10);

            return $this->shortlinks->getTotal();
        });

        return $this->json(compact('count'));
    }

    #[Route('/admin/all-shortlinks', methods: ['POST'])]
    public function getAllShortlinks(): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $shortlinks = $this->shortlinks->createQueryBuilder('s')
            ->leftJoin('s.creator', 'c')
            ->select('s.shortcode, s.secret, s.destination, s.creator_ip, s.disabled, s.expires_at, s.created_at')
            ->addSelect('c.id as user_id, c.username as user_username, c.sub as user_sub')
            ->orderBy('s.created_at', 'DESC')
            ->getQuery()
            ->execute();

        return $this->json($shortlinks);
    }

    #[Route('/admin/toggle-shortlink-disabled', methods: ['PATCH'])]
    public function toggleShortlinkDisabled(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $payload = $request->getPayload();

        $this->abortUnless($payload->has('shortcode'), 400, $this->translator->trans('error.shortlink.shortcode.missing'));

        $shortcode = $payload->get('shortcode');
        /** @var Shortlink $shortlink */
        $shortlink = $this->shortlinks->createQueryBuilder('s')
            ->where('s.shortcode = :shortcode')
            ->setParameter('shortcode', $shortcode)
            ->getQuery()
            ->getOneOrNullResult();

        $this->abortUnless(!!$shortlink, 404);

        $shortlink->toggleDisabled();

        $this->shortlinks->save($shortlink, true);

        return $this->json([]);
    }
}

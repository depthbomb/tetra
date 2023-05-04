<?php namespace App\Controller;

use App\Entity\Shortlink;
use App\Attribute\CsrfProtected;
use App\Repository\ShortlinkRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin')]
#[CsrfProtected('ajax')]
class AdminController extends BaseController
{
    public function __construct(private readonly ShortlinkRepository $shortlinks,) {}

    #[Route('/all-shortlinks', methods: 'POST')]
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

    #[Route('/toggle-shortlink-disabled', methods: 'PATCH')]
    public function toggleShortlinkDisabled(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $form = $request->request;

        $this->abortUnless($form->has('shortcode'), 400, 'Please provide a shortcode');

        $shortcode = $form->get('shortcode');
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

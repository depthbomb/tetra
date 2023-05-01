<?php namespace App\Controller;

use App\Attribute\CsrfProtected;
use App\Repository\ShortlinkRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin')]
#[CsrfProtected('ajax')]
class AdminController extends BaseController
{
    public function __construct(
        private readonly ShortlinkRepository $shortlinks,
    ) {}

    #[Route('/all-shortlinks', methods: 'POST')]
    public function getAllShortlinks(): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $shortlinks = $this->shortlinks->createQueryBuilder('s')
            ->leftJoin('s.creator', 'c')
            ->select('s.shortcode, s.secret, s.destination, s.creator_ip, s.expires_at, s.created_at')
            ->addSelect('c.id as user_id, c.username as user_username, c.sub as user_sub')
            ->orderBy('s.created_at', 'DESC')
            ->getQuery()
            ->execute();

        return $this->json($shortlinks);
    }
}

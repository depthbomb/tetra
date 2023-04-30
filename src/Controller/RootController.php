<?php namespace App\Controller;

use App\Attribute\RateLimited;
use App\Repository\ShortlinkRepository;
use Doctrine\ORM\NonUniqueResultException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;

class RootController extends BaseController
{
    #[Route('/', name: 'root')]
    public function serveSpa(): Response
    {
        return $this->render('root/root.html.twig');
    }

    /**
     * @throws NonUniqueResultException
     */
    #[RateLimited('redirection')]
    #[Route('/{shortcode}', name: 'shortlink_redirect')]
    public function attemptRedirection(ShortlinkRepository $shortlinks, string $shortcode): Response
    {
        $shortlink = $shortlinks->createQueryBuilder('s')
            ->where('s.shortcode = :shortcode')
            ->andWhere('s.disabled = false')
            ->setParameter('shortcode', $shortcode)
            ->select('s.destination, s.disabled')
            ->getQuery()
            ->getOneOrNullResult();

        if ($shortlink and !$shortlink['disabled'])
        {
            return new RedirectResponse($shortlink['destination']);
        }

        return $this->redirectToRoute('root');
    }
}

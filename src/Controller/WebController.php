<?php namespace App\Controller;

use App\Attribute\RateLimited;
use App\Repository\ShortlinkRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;

class WebController extends BaseController
{
    #[Route('/', name: 'root')]
    public function serveSpa(): Response
    {
        return $this->render('root/root.html.twig');
    }

    #[Route('/{shortcode}+', name: 'shortlink_expand', stateless: true)]
    public function redirectToExpanded(string $shortcode): Response
    {
        return $this->redirect("/#/shortlink/$shortcode");
    }

    #[RateLimited('redirection')]
    #[Route('/{shortcode}', name: 'shortlink_redirect', stateless: true)]
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

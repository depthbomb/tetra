<?php namespace App\Controller;

use App\Util\Killswitch;
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
        $this->abortUnless(
            Killswitch::isEnabled(Killswitch::SHORTLINK_REDIRECTION_ENABLED),
            Response::HTTP_BAD_GATEWAY,
            'Shortlink redirection is temporarily disabled'
        );

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

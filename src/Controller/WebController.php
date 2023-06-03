<?php namespace App\Controller;

use App\Service\StaticService;
use App\Attribute\RateLimited;
use Symfony\Component\WebLink\Link;
use App\Repository\ShortlinkRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;

class WebController extends BaseController
{
    public function __construct(private readonly StaticService $static) {}

    #[Route('/', name: 'root')]
    public function serveSpa(): Response
    {
        return $this->render('root/root.html.twig', response: $this->buildEarlyHints());
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

    private function buildEarlyHints(): Response
    {
        $links = [];
        foreach ([...$this->static->getEntries(), ...$this->static->getEntries('css')] as $asset)
        {
            $link = new Link(href: $asset);
            if (str_ends_with($asset, 'js'))
            {
                $link = $link->withAttribute('as', 'script');
            }
            else
            {
                $link = $link->withAttribute('as', 'stylesheet');
            }

            $links[] = $link;
        }

        return $this->sendEarlyHints($links);
    }
}

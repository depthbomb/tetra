<?php namespace App\Controller;

use App\Util\Killswitch;
use App\Attribute\RateLimited;
use App\Repository\ShortlinkRepository;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Contracts\Translation\TranslatorInterface;

class WebController extends Controller
{
    public function __construct(private readonly TranslatorInterface $translator) {}

    #[Route('/', name: 'root')]
    public function index(): Response
    {
        return $this->render('web/index.html.twig');
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
        $this->requireFeature(Killswitch::SHORTLINK_REDIRECTION_ENABLED, $this->translator->trans('error.shortlink.redirection_feature_disabled'));

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

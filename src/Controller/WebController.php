<?php namespace App\Controller;

use App\Attribute\RateLimited;
use App\Repository\ShortlinkRepository;
use App\Message\RecordShortlinkHitMessage;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Contracts\Translation\TranslatorInterface;

class WebController extends Controller
{
    public function __construct(
        private readonly TranslatorInterface $translator,
        private readonly RequestStack        $request,
        private readonly MessageBusInterface $bus,
    ) {}

    #[Route('/', name: 'root', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('web/index.html.twig');
    }

    #[Route('/{shortcode}+', name: 'shortlink_expand', methods: ['GET'])]
    public function redirectToExpanded(string $shortcode): Response
    {
        return $this->redirect("/#/shortlink/$shortcode");
    }

    #[RateLimited('redirection')]
    #[Route('/{shortcode}', name: 'shortlink_redirect', methods: ['GET'])]
    public function attemptRedirection(ShortlinkRepository $shortlinks, string $shortcode): Response
    {
        $this->requireFeature('SHORTLINK_REDIRECTION', $this->translator->trans('error.shortlink.redirection_feature_disabled'));

        $shortlink = $shortlinks->createQueryBuilder('s')
            ->where('s.shortcode = :shortcode')
            ->andWhere('s.disabled = false')
            ->setParameter('shortcode', $shortcode)
            ->select('s.destination, s.disabled')
            ->getQuery()
            ->getOneOrNullResult();

        if ($shortlink and !$shortlink['disabled'])
        {
            $request    = $this->request->getMainRequest();
            $headers    = $request->headers;
            $server     = $request->server;
            $ip         = $request->getClientIp();
            $user_agent = $server->getString('HTTP_USER_AGENT', 'Unknown');
            $referrer   = $headers->get('Referrer');

            $this->bus->dispatch(new RecordShortlinkHitMessage($shortcode, $ip, $user_agent, $referrer));

            return new RedirectResponse($shortlink['destination']);
        }

        return $this->redirectToRoute('root');
    }
}

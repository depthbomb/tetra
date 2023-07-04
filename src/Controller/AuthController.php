<?php namespace App\Controller;

use App\Attribute\RateLimited;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Depthbomb\CsrfBundle\Attribute\CsrfProtected;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Translation\TranslatorInterface;

#[Route('/oidc')]
class AuthController extends Controller
{
    public function __construct(private readonly TranslatorInterface $translator) {}

    #[RateLimited('authentication')]
    #[Route('/start', name: 'auth.start', methods: ['GET'])]
    public function startFlow(ClientRegistry $registry): Response
    {
        $this->requireFeature('USER_LOGIN', $this->translator->trans('error.user.authentication_feature_disabled'));

        return $registry->getClient('superfish')->redirect();
    }

    #[Route('/callback', name: 'auth.callback', methods: ['GET'])]
    public function handleCallback(): Response
    {
        // This action should normally be never called as the callback is handled by the authenticator
        return $this->json([]);
    }

    #[CsrfProtected('auth')]
    #[Route('/invalidate', name: 'auth.invalidate', methods: ['GET', 'POST'])]
    public function handleLogout(Security $security, RequestStack $request_stack): Response
    {
        if ($this->loggedIn())
        {
            $security->logout(false);

            $request = $request_stack->getMainRequest();
            $query   = $request->query;
            if ($query->has('goto'))
            {
                return $this->redirect($query->getString('goto'));
            }
        }

        return $this->redirectToRoute('web.home');
    }
}

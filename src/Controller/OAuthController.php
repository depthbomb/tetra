<?php namespace App\Controller;

use App\Util\Killswitch;
use App\Attribute\RateLimited;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Depthbomb\CsrfBundle\Attribute\CsrfProtected;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;

#[Route('/oidc')]
class OAuthController extends Controller
{
    private const OAUTH_PROVIDER = 'superfish';

    #[RateLimited('authentication')]
    #[Route('/start', name: 'oidc_start')]
    public function startFlow(ClientRegistry $registry): Response
    {
        $this->abortUnless(
            Killswitch::isEnabled(Killswitch::USER_LOGIN_ENABLED),
            Response::HTTP_BAD_GATEWAY,
            'User authentication is temporarily disabled'
        );

        return $registry->getClient($this::OAUTH_PROVIDER)->redirect();
    }

    #[Route('/callback', name: 'oidc_callback')]
    public function handleCallback(): Response
    {
        // This action should normally be never called as the callback is handled by the authenticator
        return $this->json([]);
    }

    #[CsrfProtected('auth')]
    #[Route('/invalidate', name: 'oidc_destroy', methods: ['POST'])]
    public function handleLogout(Security $security): Response
    {
        if ($this->loggedIn())
        {
            // $validateCsrfToken is false as we are using our own solution for handling CSRF
            $security->logout(false);
        }

        return new Response(null, 200);
    }
}

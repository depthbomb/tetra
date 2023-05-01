<?php namespace App\Controller;

use App\Attribute\RateLimited;
use App\Attribute\CsrfProtected;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Component\RateLimiter\RateLimiterFactory;

#[Route('/oidc')]
class OAuthController extends BaseController
{
    private const OAUTH_PROVIDER = 'superfish';

    public function __construct(
        private readonly RateLimiterFactory $authenticationLimiter
    ) {}

    #[RateLimited('authentication')]
    #[Route('/start', name: 'oidc_start')]
    public function startFlow(Request $request, ClientRegistry $registry): Response
    {
        $this->authenticationLimiter->create($request->getClientIp())->consume()->ensureAccepted();

        return $registry->getClient($this::OAUTH_PROVIDER)->redirect();
    }

    #[Route('/callback', name: 'oidc_callback')]
    public function handleCallback(): Response
    {
        // This action should normally be never called as the callback is handled by the authenticator
        return $this->json(null);
    }

    #[CsrfProtected('auth')]
    #[Route('/invalidate', name: 'oidc_destroy', methods: 'POST')]
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

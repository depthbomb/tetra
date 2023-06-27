<?php namespace App\Controller;

use App\Util\Features;
use App\Attribute\RateLimited;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Depthbomb\CsrfBundle\Attribute\CsrfProtected;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Contracts\Translation\TranslatorInterface;

#[Route('/oidc')]
class OAuthController extends Controller
{
    public function __construct(private readonly TranslatorInterface $translator) {}

    #[RateLimited('authentication')]
    #[Route('/start', name: 'oidc_start', methods: ['GET'])]
    public function startFlow(ClientRegistry $registry): Response
    {
        $this->requireFeature('USER_LOGIN', $this->translator->trans('error.user.authentication_feature_disabled'));

        return $registry->getClient('superfish')->redirect();
    }

    #[Route('/callback', name: 'oidc_callback', methods: ['GET'])]
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

        return new Response(null, Response::HTTP_OK);
    }
}

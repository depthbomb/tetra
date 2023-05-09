<?php namespace App\Security;

use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\RememberMeBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class OAuthAuthenticator extends OAuth2Authenticator implements AuthenticationEntryPointInterface
{
    public function __construct(
        private readonly ClientRegistry  $registry,
        private readonly RouterInterface $router,
        private readonly UserRepository  $users,
    ) {}

    /**
     * @inheritDoc
     */
    public function start(Request $request, AuthenticationException $authException = null): Response
    {
        return new RedirectResponse('/oidc/start', Response::HTTP_TEMPORARY_REDIRECT);
    }

    /**
     * @inheritDoc
     */
    public function supports(Request $request): ?bool
    {
        return $request->attributes->get('_route') === 'oidc_callback';
    }

    /**
     * @inheritDoc
     */
    public function authenticate(Request $request): Passport
    {
        $client = $this->registry->getClient('superfish');
        $token  = $this->fetchAccessToken($client);

        return new SelfValidatingPassport(
            new UserBadge($token->getToken(), function () use ($token, $client) {
                /** @var SuperfishResourceOwner $superfish_user */
                $superfish_user = $client->fetchUserFromToken($token);
                $roles          = [in_array('tetra_admin', $superfish_user->getGroups()) ? 'ROLE_ADMIN' : 'ROLE_USER'];
                $user           = $this->users->findOneBy(['sub' => $superfish_user->getId()]);

                if ($user)
                {
                    // set user roles just in case they may have changed
                    $user->setRoles($roles);
                    $this->users->save($user);

                    return $user;
                }

                return $this->users->findOneOrCreate(
                    $superfish_user->getUsername(),
                    $superfish_user->getEmail(),
                    $superfish_user->getId(),
                    $roles
                );
            }),
            [
                new RememberMeBadge()
            ]
        );
    }

    /**
     * @inheritDoc
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): Response
    {
        $target = $this->router->generate('root');

        return new RedirectResponse($target);
    }

    /**
     * @inheritDoc
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        $message = strtr($exception->getMessageKey(), $exception->getMessageData());

        return new Response($message, Response::HTTP_FORBIDDEN);
    }
}

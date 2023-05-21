<?php namespace App\Security;

use Psr\Http\Message\ResponseInterface;
use League\OAuth2\Client\Token\AccessToken;
use League\OAuth2\Client\Provider\AbstractProvider;
use App\Exception\SuperfishIdentityProviderException;
use League\OAuth2\Client\Tool\BearerAuthorizationTrait;
use League\OAuth2\Client\Provider\ResourceOwnerInterface;

class SuperfishProvider extends AbstractProvider
{
    use BearerAuthorizationTrait;

    public const DOMAIN = 'https://auth.super.fish';

    /**
     * @inheritDoc
     */
    public function getBaseAuthorizationUrl(): string
    {
        return $this::DOMAIN.'/application/o/authorize/';
    }

    /**
     * @inheritDoc
     */
    public function getBaseAccessTokenUrl(array $params): string
    {
        return $this::DOMAIN.'/application/o/token/';
    }

    /**
     * @inheritDoc
     */
    public function getResourceOwnerDetailsUrl(AccessToken $token): string
    {
        return $this::DOMAIN.'/application/o/userinfo/';
    }

    /**
     * @inheritDoc
     */
    protected function getDefaultScopes(): array
    {
        return ['openid', 'email', 'profile'];
    }

    /**
     * @inheritDoc
     */
    protected function getScopeSeparator(): string
    {
        return ' ';
    }

    /**
     * @inheritDoc
     */
    protected function checkResponse(ResponseInterface $response, $data): void
    {
        if ($response->getStatusCode() >= 400)
        {
            // authentik puts the error message in Www-Authenticate header, so we'll parse that to get our error info
            $headers      = $response->getHeader('www-authenticate');
            $header_value = $headers[0];

            if (preg_match("/error=\"(?P<error>[^\"]*)\", error_description=\"(?P<error_description>[^\"]*)\"/", $header_value, $matches))
            {
                $error_name    = $matches['error'];
                $error_message = $matches['error_description'];

                throw SuperfishIdentityProviderException::clientException($response, json_encode([
                    'error'   => $error_name,
                    'message' => $error_message
                ]));
            } else
            {
                // TODO
                throw SuperfishIdentityProviderException::clientException($response, json_encode('unknown'));
            }
        }
    }

    /**
     * @inheritDoc
     */
    protected function createResourceOwner(array $response, AccessToken $token): ResourceOwnerInterface
    {
        return new SuperfishResourceOwner($response);
    }
}

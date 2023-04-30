<?php namespace App\Exception;

use Psr\Http\Message\ResponseInterface;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;

class SuperfishIdentityProviderException extends IdentityProviderException
{
    public static function clientException(ResponseInterface $response, $data): static
    {
        return static::fromResponse($response, $data);
    }

    protected static function fromResponse(ResponseInterface $response, $message = null): static
    {
        return new static($message, $response->getStatusCode(), (string)$response->getBody());
    }
}

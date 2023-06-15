<?php namespace App\Security;

use League\OAuth2\Client\Tool\ArrayAccessorTrait;
use League\OAuth2\Client\Provider\ResourceOwnerInterface;

class SuperfishResourceOwner implements ResourceOwnerInterface
{
    use ArrayAccessorTrait;

    public function __construct(private readonly array $response) {}

    /**
     * @inheritDoc
     */
    public function getId(): string
    {
        return $this->getSub();
    }

    public function getUsername(): string
    {
        return $this->getValueByKey($this->response, 'preferred_username');
    }

    public function getEmail(): string
    {
        return $this->getValueByKey($this->response, 'email');
    }

    /**
     * @return string[]
     */
    public function getGroups(): array
    {
        return $this->getValueByKey($this->response, 'groups');
    }

    public function getSub(): string
    {
        return $this->getValueByKey($this->response, 'sub');
    }

    public function isAdmin(): bool
    {
        return in_array('tetra_admin', $this->getGroups());
    }

    /**
     * @inheritDoc
     */
    public function toArray(): array
    {
        return $this->response;
    }
}

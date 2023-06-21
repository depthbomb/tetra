<?php namespace App\Service;

use Symfony\Component\HttpFoundation\ParameterBag;

readonly class ResponseHeaderBag
{
    private ParameterBag $headers;

    public function __construct()
    {
        $this->headers = new ParameterBag();
    }

    /**
     * @return array<string, string>[]
     */
    public function getHeaders(): array
    {
        return $this->headers->all();
    }

    /**
     * @param string $key
     * @param string $value
     *
     * @return $this
     */
    public function add(string $key, string $value): self
    {
        $this->headers->set($key, $value);

        return $this;
    }

    public function get(string $key, string $default = null): ?string
    {
        return $this->headers->get($key, $default);
    }

    /**
     * @param array<string, mixed> $headers
     *
     * @return $this
     */
    public function set(array $headers): self
    {
        $this->headers->replace($headers);

        return $this;
    }
}

<?php namespace App\Service;

class ResponseHeaderBag
{
    /**
     * @var array<string, mixed>
     */
    protected array $headers = [];

    /**
     * @return array
     */
    public function getHeaders(): array
    {
        return $this->headers;
    }

    /**
     * @param string $key
     * @param mixed $value
     *
     * @return $this
     */
    public function add(string $key, mixed $value): self
    {
        $this->headers[$key] = $value;

        return $this;
    }

    /**
     * @param array<string, mixed> $headers
     *
     * @return $this
     */
    public function set(array $headers): self
    {
        $this->headers = $headers;

        return $this;
    }
}

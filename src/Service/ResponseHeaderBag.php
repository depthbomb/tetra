<?php namespace App\Service;

class ResponseHeaderBag
{
    /**
     * @var array<string, string>[]
     */
    private array $headers = [];

    /**
     * @return array<string, string>[]
     */
    public function getHeaders(): array
    {
        return $this->headers;
    }

    /**
     * @param string $key
     * @param string $value
     *
     * @return $this
     */
    public function add(string $key, string $value): self
    {
        $this->headers[$key] = $value;

        return $this;
    }

    public function get(string $key, string $default = null): ?string
    {
        foreach ($this->headers as $header)
        {
            if (isset($header[$key]))
            {
                return $header[$key];
            }
        }

        return $default;
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

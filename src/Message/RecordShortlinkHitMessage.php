<?php namespace App\Message;

final class RecordShortlinkHitMessage
{
    private readonly string  $shortcode;
    private readonly string  $ip;
    private readonly string  $user_agent;
    private readonly ?string $referrer;

    public function __construct(string $shortcode, string $ip, string $user_agent, ?string $referrer)
    {
        $this->shortcode  = $shortcode;
        $this->ip         = $ip;
        $this->user_agent = $user_agent;
        $this->referrer   = $referrer;
    }

    public function getShortcode(): string
    {
        return $this->shortcode;
    }

    public function getIp(): string
    {
        return $this->ip;
    }

    public function getUserAgent(): string
    {
        return $this->user_agent;
    }

    public function getReferrer(): ?string
    {
        return $this->referrer;
    }
}

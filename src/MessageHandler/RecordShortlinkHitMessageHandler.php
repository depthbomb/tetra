<?php namespace App\MessageHandler;

use App\Entity\Hit;
use App\Repository\HitRepository;
use App\Repository\ShortlinkRepository;
use App\Message\RecordShortlinkHitMessage;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

class RecordShortlinkHitMessageHandler
{
    public function __construct(
        private readonly ShortlinkRepository $shortlinks,
        private readonly HitRepository       $hits
    ) {}

    #[AsMessageHandler]
    public function recordHit(RecordShortlinkHitMessage $message): void
    {
        $shortlink = $this->shortlinks->findOneByShortcode($message->getShortcode());
        if (is_null($shortlink))
        {
            return;
        }

        $hit = new Hit;
        $hit->setShortlink($shortlink);
        $hit->setIp($this->hashIp($message));
        $hit->setUserAgent($message->getUserAgent());
        $hit->setReferrer($message->getReferrer());

        $this->hits->save($hit, true);
    }

    private function hashIp(RecordShortlinkHitMessage $message): string
    {
        $ip        = $message->getIp();
        $shortcode = $message->getShortcode();
        $ip_length = strlen($ip);
        if ($ip_length >= 7 and $ip_length <= 15)
        {
            $ip = (string) ip2long($ip);
        }

        $secret = $_ENV['APP_SECRET'];

        // This is in no way a super secure way to hash a user's IP, but IPs aren't a bulletproof way to identify
        // someone anyway.
        return base64_encode(hash_hmac('sha3-512', $secret.$ip.$shortcode.$secret, $secret, true));
    }
}

<?php namespace App\EventListener;

use App\Util\CspNonce;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::RESPONSE, 'onKernelResponse')]
readonly class SecurityHeadersListener
{
    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest())
        {
            return;
        }

        $response = $event->getResponse();
        $headers  = $response->headers;

        $nonce        = CspNonce::getNonce();
        $header_value = "script-src 'nonce-$nonce' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:; object-src 'none'; base-uri 'self';";
        $headers->set('Content-Security-Policy', $header_value);

        $headers->set('Content-Type-Options', 'nosniff');

        $headers->set('X-Xss-Protection', '1;mode=block;');
    }
}

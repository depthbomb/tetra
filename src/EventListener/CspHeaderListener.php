<?php namespace App\EventListener;

use App\Util\CspNonce;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::RESPONSE, 'onKernelResponse')]
readonly class CspHeaderListener
{
    public function onKernelResponse(ResponseEvent $response): void
    {
        $nonce  = CspNonce::getNonce();
        $header = "script-src 'nonce-$nonce' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:; object-src 'none'; base-uri 'self';";

        $response->getResponse()->headers->set('Content-Security-Policy', $header);
    }
}

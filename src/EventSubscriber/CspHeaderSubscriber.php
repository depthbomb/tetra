<?php namespace App\EventSubscriber;

use App\Service\CspService;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CspHeaderSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly CspService $csp
    ) {}

    /**
     * @inheritDoc
     */
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::RESPONSE => 'onKernelResponse'];
    }

    public function onKernelResponse(ResponseEvent $response): void
    {
        $nonce  = $this->csp->getNonce();
        $header = "script-src 'nonce-$nonce' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:; object-src 'none'; base-uri 'self';";

        $response->getResponse()->headers->set('Content-Security-Policy', $header);
    }
}

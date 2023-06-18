<?php namespace App\EventSubscriber;

use App\Service\ResponseHeaderBag;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::RESPONSE, 'onKernelResponse', -1024)]
readonly class ResponseHeadersSubscriber
{
    public function __construct(private ResponseHeaderBag $headerBag) {}

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest())
        {
            return;
        }

        $event->getResponse()->headers->add(
            $this->headerBag->getHeaders()
        );
    }
}

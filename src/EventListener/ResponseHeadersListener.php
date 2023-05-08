<?php namespace App\EventListener;

use App\Service\ResponseHeaderBag;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::RESPONSE, 'onKernelResponse')]
class ResponseHeadersListener
{
    public function __construct(private readonly ResponseHeaderBag $headerBag) {}

    public function onKernelResponse(ResponseEvent $event): void
    {
        $headers = $event->getResponse()->headers;

        $headers->add($this->headerBag->getHeaders());
    }
}

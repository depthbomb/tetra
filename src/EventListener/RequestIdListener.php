<?php namespace App\EventListener;

use Symfony\Component\Uid\UuidV7;
use App\Service\ResponseHeaderBag;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::REQUEST, 'onKernelRequest', PHP_INT_MAX - 10)]
readonly class RequestIdListener
{
    public function __construct(private ResponseHeaderBag $headerBag) {}

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest())
        {
            return;
        }

        $request_id = UuidV7::generate();

        // Add the request ID to the parameter bag, so it can be retrieved elsewhere such as in the BridgeService
        $event->getRequest()->attributes->set('_request_id', $request_id);
        $this->headerBag->add('X-Powered-By', 'Tetra')->add('X-Request-Id', $request_id);
    }
}

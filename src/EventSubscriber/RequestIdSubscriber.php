<?php namespace App\EventSubscriber;

use Symfony\Component\Uid\Ulid;
use App\Service\ResponseHeaderBag;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class RequestIdSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ResponseHeaderBag $headerBag
    ) {}

    /**
     * @inheritDoc
     */
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', 1024]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest())
        {
            return;
        }

        $request_id = Ulid::generate();

        // Add the request ID to the parameter bag, so it can be retrieved elsewhere such as in the BridgeService
        $event->getRequest()->attributes->set('_request_id', $request_id);
        $this->headerBag->add('X-PoweredBy', 'Tetra')->add('X-Request-Id', $request_id);
    }
}

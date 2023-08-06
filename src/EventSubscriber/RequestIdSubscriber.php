<?php namespace App\EventSubscriber;

use Symfony\Component\Uid\Ulid;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

class RequestIdSubscriber
{
    private ?string $requestId = null;

    #[AsEventListener(priority: 1024)]
    public function onRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest())
        {
            return;
        }

        $this->requestId = Ulid::generate();

        // Add the request ID to the parameter bag, so it can be retrieved elsewhere such as in the BridgeService
        $event->getRequest()->attributes->set('_request_id', $this->requestId);
    }

    #[AsEventListener]
    public function onResponse(ResponseEvent $event): void
    {
        if ($this->requestId)
        {
            $response = $event->getResponse();
            $response->headers->set('X-Request-Id', $this->requestId);
        }
    }
}

<?php namespace App\EventSubscriber;

use App\Service\ResponseHeaderBag;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * The ResponseHeadersSubscriber class handles applying headers from the HeaderBag to the response.
 */
class ResponseHeadersSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly ResponseHeaderBag $headerBag) {}

    /**
     * @inheritDoc
     */
    public static function getSubscribedEvents(): array
    {
        return [ResponseEvent::class => 'onKernelResponse'];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        $headers = $event->getResponse()->headers;

        $headers->add($this->headerBag->getHeaders());
    }
}

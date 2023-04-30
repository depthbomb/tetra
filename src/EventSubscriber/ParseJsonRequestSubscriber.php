<?php namespace App\EventSubscriber;

use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ParseJsonRequestSubscriber implements EventSubscriberInterface
{

    /**
     * @inheritDoc
     */
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => 'onKernelRequest'];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        if ($request->getContentTypeFormat() === 'json')
        {
            // TODO validate JSON after migrating to PHP 8.3

            $json_body = json_decode($request->getContent(), true);

            $request->request->replace(is_array($json_body) ? $json_body : []);
        }
    }
}

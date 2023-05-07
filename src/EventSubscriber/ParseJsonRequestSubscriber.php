<?php namespace App\EventSubscriber;

use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

// TODO remove this subscriber when Symfony 8.3 releases to utilize the new getPayload() method that can parse JSON request payloads
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
            $json = $request->getContent();
            if (json_validate($json))
            {
                $json_body = json_decode($json, true);

                $request->request->replace(is_array($json_body) ? $json_body : []);
            }
        }
    }
}

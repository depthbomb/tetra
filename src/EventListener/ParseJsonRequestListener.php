<?php namespace App\EventListener;

use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

// TODO remove this listener when Symfony 8.3 releases to utilize the new getPayload() method that can parse JSON request payloads
#[AsEventListener(KernelEvents::REQUEST, 'onKernelRequest')]
class ParseJsonRequestListener
{
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

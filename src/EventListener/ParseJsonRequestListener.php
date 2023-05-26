<?php namespace App\EventListener;

use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

// TODO remove this listener when Symfony 6.3 releases
#[AsEventListener(KernelEvents::REQUEST, 'onKernelRequest', PHP_INT_MAX - 20)]
class ParseJsonRequestListener
{
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        if ($request->getContentTypeFormat() === 'json')
        {
            $json = $request->getContent();

            if (!empty($json))
            {
                if (json_validate($json))
                {
                    $json_body = json_decode($json, true);

                    $request->request->replace($json_body);
                }
                else
                {
                    throw new HttpException(422);
                }
            }
        }
    }
}

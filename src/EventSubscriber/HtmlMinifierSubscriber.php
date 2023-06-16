<?php namespace App\EventSubscriber;

use voku\helper\HtmlMin;
use App\Util\Killswitch;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::RESPONSE, 'onKernelResponse', PHP_INT_MIN)]
class HtmlMinifierSubscriber
{
    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest() or !Killswitch::RENDERED_HTML_MINIFICATION_ENABLED)
        {
            return;
        }

        $response = $event->getResponse();
        $content  = $response->getContent();
        $minifier = new HtmlMin;
        $minified = $minifier->minify($content);

        $response->setContent($minified);
    }
}

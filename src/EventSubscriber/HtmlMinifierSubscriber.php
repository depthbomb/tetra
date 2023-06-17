<?php namespace App\EventSubscriber;

use voku\helper\HtmlMin;
use App\Util\Killswitch;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::RESPONSE, 'onKernelResponse', PHP_INT_MIN)]
class HtmlMinifierSubscriber
{
    public function __construct(private readonly KernelInterface $kernel) {}

    public function onKernelResponse(ResponseEvent $event): void
    {
        $dev      = $this->kernel->getEnvironment() === 'dev';
        $request  = $event->getRequest();
        $response = $event->getResponse();
        $route    = $request->attributes->getString('_route');

        if (!$event->isMainRequest() or $dev or $route !== 'root' or !Killswitch::RENDERED_HTML_MINIFICATION_ENABLED)
        {
            return;
        }

        $content  = $response->getContent();
        $minifier = new HtmlMin;
        $minified = $minifier->minify($content);

        $response->setContent($minified);
    }
}

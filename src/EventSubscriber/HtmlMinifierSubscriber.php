<?php namespace App\EventSubscriber;

use App\Util\Features;
use voku\helper\HtmlMin as Minifier;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

class HtmlMinifierSubscriber
{
    public function __construct(private readonly KernelInterface $kernel) {}

    #[AsEventListener(priority: -2048)]
    public function onKernelResponse(ResponseEvent $event): void
    {
        $is_dev      = $this->kernel->getEnvironment() === 'dev';
        $request     = $event->getRequest();
        $response    = $event->getResponse();
        $is_not_root = $request->attributes->getString('_route') !== 'root';

        if (!$event->isMainRequest() or $is_dev or $is_not_root or !Features::isFeatureEnabled('RENDERED_HTML_MINIFICATION'))
        {
            return;
        }

        $content  = $response->getContent();
        $minifier = new Minifier;
        $minified = $minifier->minify($content);

        $response->setContent($minified);
    }
}

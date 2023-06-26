<?php namespace App\EventSubscriber;

use voku\helper\HtmlMin;
use App\Util\Killswitch;
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

        if (!$event->isMainRequest() or $is_dev or $is_not_root or !Killswitch::RENDERED_HTML_MINIFICATION_ENABLED)
        {
            return;
        }

        $content  = $response->getContent();
        $minifier = new HtmlMin;
        $minified = $minifier->minify($content);

        $response->setContent($minified);
    }
}

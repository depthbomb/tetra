<?php namespace App\EventSubscriber;

use voku\helper\HtmlMin;
use App\Util\Killswitch;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::RESPONSE, 'onKernelResponse', PHP_INT_MIN)]
readonly class HtmlMinifierSubscriber
{
    public function __construct(private KernelInterface $kernel) {}

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

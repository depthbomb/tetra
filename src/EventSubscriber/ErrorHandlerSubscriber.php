<?php namespace App\EventSubscriber;

use App\Service\ErrorHandlerService;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::EXCEPTION, 'onKernelException', 2048)]
readonly class ErrorHandlerSubscriber
{
    public function __construct(private ErrorHandlerService $errorHandler) {}

    public function onKernelException(ExceptionEvent $event): void
    {
        if (!$event->isMainRequest())
        {
            return;
        }

        $exception = $event->getThrowable();
        $res       = $this->errorHandler->createErrorResponseFromException($exception);

        $event->setResponse($res);
    }
}

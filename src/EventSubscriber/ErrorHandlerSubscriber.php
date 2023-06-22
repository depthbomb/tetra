<?php namespace App\EventSubscriber;

use App\Service\ErrorHandlerService;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

class ErrorHandlerSubscriber
{
    public function __construct(private readonly ErrorHandlerService $errorHandler) {}

    #[AsEventListener]
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

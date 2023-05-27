<?php namespace App\EventListener;

use App\Service\ErrorHandlerService;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::EXCEPTION, 'onKernelException', PHP_INT_MAX - 100)]
readonly class ErrorHandlerListener
{
    public function __construct(private ErrorHandlerService $errorHandler) {}

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $res = $this->errorHandler->createErrorResponseFromException($exception);

        $event->setResponse($res);
    }
}

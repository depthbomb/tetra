<?php namespace App\EventListener;

use App\Service\FormatService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::EXCEPTION, 'onKernelException', PHP_INT_MAX - 100)]
class ErrorHandlerListener
{
    public function __construct(private readonly FormatService $format) {}

    public function onKernelException(ExceptionEvent $event): void
    {
        $code      = Response::HTTP_INTERNAL_SERVER_ERROR;
        $exception = $event->getThrowable();
        if ($exception instanceof HttpException)
        {
            $code = $exception->getStatusCode();
        }

        $res = $this->format->createFormattedResponse([
            'status'  => $code,
            'message' => $exception->getMessage() !== '' ? $exception->getMessage() : Response::$statusTexts[$code],
        ], $code);

        $event->setResponse($res);
    }
}

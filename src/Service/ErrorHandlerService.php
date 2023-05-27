<?php namespace App\Service;

use Throwable;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

readonly class ErrorHandlerService
{
    public function __construct(private FormatService $format) {}

    public function createErrorResponseFromException(Throwable $exception): Response
    {
        $code = Response::HTTP_INTERNAL_SERVER_ERROR;
        if ($exception instanceof HttpException)
        {
            $code = $exception->getStatusCode();
        }

        return $this->format->createFormattedResponse([
            'status'  => $code,
            'message' => $exception->getMessage() !== '' ? $exception->getMessage() : Response::$statusTexts[$code],
        ], $code);
    }
}

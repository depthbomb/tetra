<?php namespace App\Service;

use Throwable;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\HttpException;

readonly class ErrorHandlerService
{
    public function __construct(private FormatService $format, private RequestStack $request) {}

    public function createErrorResponseFromException(Throwable $exception): Response
    {
        $code = Response::HTTP_INTERNAL_SERVER_ERROR;
        if ($exception instanceof HttpException)
        {
            $code = $exception->getStatusCode();
        }

        $request_id = $this->request->getMainRequest()->attributes->get('_request_id');

        return $this->format->createFormattedResponse([
            'request_id' => $request_id,
            'status'     => $code,
            'message'    => $exception->getMessage() !== '' ? $exception->getMessage() : Response::$statusTexts[$code],
        ], $code);
    }
}

<?php namespace App\Service;

use Throwable;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\HttpException;

readonly class ErrorHandlerService
{
    public function __construct(
        private RequestStack    $request,
        private FormatService   $format,
        private KernelInterface $kernel,
    ) {}

    public function createErrorResponseFromException(Throwable $exception): Response
    {
        $code = Response::HTTP_INTERNAL_SERVER_ERROR;
        if ($exception instanceof HttpException)
        {
            $code = $exception->getStatusCode();
        }

        $request_id = $this->request->getMainRequest()->attributes->get('_request_id');
        $data = [
            'request_id' => $request_id,
            'status'     => $code,
            'message'    => $exception->getMessage() !== '' ? $exception->getMessage() : Response::$statusTexts[$code],
        ];

        if ($this->kernel->getEnvironment() !== 'prod')
        {
            $data['trace'] = $data['message'].PHP_EOL.$exception->getTraceAsString();
        }

        return $this->format->createFormattedResponse($data, $code);
    }
}

<?php namespace App\Controller;

use Throwable;
use App\Service\FormatService;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ErrorController extends BaseController
{
    public function __construct(
        private readonly FormatService $format,
    ) {}

    public function show(Throwable $exception): Response
    {
        $code = Response::HTTP_INTERNAL_SERVER_ERROR;

        if ($exception instanceof HttpException)
        {
            $code = $exception->getStatusCode();
        }

        return $this->format->formatData([
            'status'  => $code,
            'message' => $exception->getMessage() !== '' ? $exception->getMessage() : Response::$statusTexts[$code],
        ], $code);
    }
}

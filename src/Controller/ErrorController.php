<?php namespace App\Controller;

use Throwable;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ErrorController extends BaseController
{
    public function show(Throwable $exception): Response
    {
        $code = Response::HTTP_INTERNAL_SERVER_ERROR;

        if ($exception instanceof HttpException)
        {
            $code = $exception->getStatusCode();
        }

        return $this->json([
            'status'  => $code,
            'message' => $exception->getMessage() !== '' ? $exception->getMessage() : Response::$statusTexts[$code],
        ], $code);
    }
}

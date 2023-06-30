<?php namespace App\Service;

use Throwable;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ErrorHandlerService
{
    public function __construct(
        private readonly Security        $security,
        private readonly RequestStack    $request,
        private readonly FormatService   $format,
        private readonly KernelInterface $kernel,
    ) {}

    public function createErrorResponseFromException(Throwable $exception): Response
    {
        $code    = Response::HTTP_INTERNAL_SERVER_ERROR;
        $message = null;
        $request = $this->request->getMainRequest();

        if ($exception instanceof HttpException)
        {
            $code = $exception->getStatusCode();
            $exception_message = $exception->getMessage();

            // Always use the exception message in the response's message as it should contain usually-human-friendly
            // messages and not provide more info than needed.
            if ($exception_message !== '')
            {
                $message = $exception_message;
            }
        }

        if ($exception instanceof AccessDeniedException)
        {
            // Handle cases where we catch an authentication error, such as from actions protected with
            // #[IsGranted(...)] or other security guards.
            // While the status code can be set in the IsGranted attribute, we set it automatically here based on
            // whether the user is logged in.

            $code = $this->isLoggedIn() ? Response::HTTP_FORBIDDEN : Response::HTTP_UNAUTHORIZED;
        }

        $request_id = $request->attributes->getString('_request_id');
        $data       = [
            'request_id' => $request_id,
            'status' => $code,
            'message' => $message ?? Response::$statusTexts[$code],
        ];

        if ($request->attributes->has('_rate_limit_reset_after'))
        {
            $data['reset_after'] = $request->attributes->get('_rate_limit_reset_after');
        }

        if ($this->isDebug())
        {
            $data['trace'] = $exception->getMessage().PHP_EOL.$exception->getTraceAsString();
        }

        return $this->format->createFormattedResponse($data, $code);
    }

    private function isDebug(): bool
    {
        return $this->kernel->getEnvironment() !== 'prod';
    }

    private function isLoggedIn(): bool
    {
        return $this->security->isGranted('IS_AUTHENTICATED');
    }
}

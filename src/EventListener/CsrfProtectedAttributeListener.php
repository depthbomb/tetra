<?php namespace App\EventListener;

use App\Attribute\CsrfProtected;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\HttpKernel\Event\ControllerArgumentsEvent;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(KernelEvents::CONTROLLER_ARGUMENTS, 'onKernelControllerArguments')]
readonly class CsrfProtectedAttributeListener
{
    private const CSRF_TOKEN_HEADER = 'X-Csrf-Token';

    public function __construct(private CsrfTokenManagerInterface $tokenManager) {}

    public function onKernelControllerArguments(ControllerArgumentsEvent $event): void
    {
        $attributes = $event->getAttributes();
        if (array_key_exists(CsrfProtected::class, $attributes))
        {
            /** @var CsrfProtected $token_attr */
            $token_attr = $attributes[CsrfProtected::class][0];
            $request    = $event->getRequest();
            $token      = $this->getTokenFromRequest($request);
            $token_id   = $token_attr->tokenId;

            if (!$token or !$this->tokenManager->isTokenValid(new CsrfToken($token_id, $token)))
            {
                $code = Response::HTTP_PRECONDITION_FAILED;
                throw new HttpException($code, Response::$statusTexts[$code]);
            }
        }
    }

    private function getTokenFromRequest(Request $request): ?string
    {
        $headers = $request->headers;
        $token   = null;

        if ($headers->has($this::CSRF_TOKEN_HEADER))
        {
            $token = $headers->get($this::CSRF_TOKEN_HEADER);
        }

        return $token;
    }
}

<?php namespace App\EventListener;

use App\Attribute\RateLimited;
use App\Service\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\LimiterInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\ControllerArgumentsEvent;

#[AsEventListener(KernelEvents::CONTROLLER_ARGUMENTS, 'onKernelControllerArguments')]
readonly class RateLimitedAttributeListener
{
    public function __construct(
        private RateLimiterFactory $authenticationLimiter,
        private RateLimiterFactory $internalApiLimiter,
        private RateLimiterFactory $redirectionLimiter,
        private RateLimiterFactory $publicApiLimiter,
        private ResponseHeaderBag  $headerBag,
    ) {}

    public function onKernelControllerArguments(ControllerArgumentsEvent $event): void
    {
        if (!$event->isMainRequest())
        {
            return;
        }

        $attributes = $event->getAttributes();
        if (array_key_exists(RateLimited::class, $attributes))
        {
            $request = $event->getRequest();

            /** @var RateLimited $rate_limit */
            $rate_limit     = $attributes[RateLimited::class][0];
            $configuration  = $rate_limit->configuration;
            $consume_amount = $rate_limit->consumeAmount;
            $limiter        = $this->getLimiter($request, $configuration);
            if (!$limiter)
            {
                return;
            }

            $result = $limiter->consume($consume_amount);
            $this->headerBag
                ->add('X-RateLimit-Limit', $result->getLimit())
                ->add('X-RateLimit-Remaining', $result->getRemainingTokens())
                ->add('X-RateLimit-Reset', $result->getRetryAfter()->getTimestamp() - time());

            if (!$result->isAccepted())
            {
                $code = Response::HTTP_TOO_MANY_REQUESTS;

                throw new HttpException($code, Response::$statusTexts[$code]);
            }
        }
    }

    private function getLimiter(Request $request, string $configuration): ?LimiterInterface
    {
        $ip      = $request->getClientIp();
        $limiter = null;
        switch ($configuration)
        {
            case 'public_api':
                $limiter = $this->publicApiLimiter;
                break;
            case 'internal_api':
                $limiter = $this->internalApiLimiter;
                break;
            case 'redirection':
                $limiter = $this->redirectionLimiter;
                break;
            case 'authentication':
                $limiter = $this->authenticationLimiter;
                break;
        }

        return $limiter?->create($ip);
    }
}

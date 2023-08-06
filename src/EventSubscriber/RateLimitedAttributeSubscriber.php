<?php namespace App\EventSubscriber;

use App\Attribute\RateLimited;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\RateLimiter\LimiterInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

class RateLimitedAttributeSubscriber
{
    private ?int $rateLimitLimit      = null;
    private ?int $rateLimitRemaining  = null;
    private ?int $rateLimitReset      = null;
    private ?int $rateLimitResetAfter = null;

    public function __construct(
        private readonly RateLimiterFactory $authenticationLimiter,
        private readonly RateLimiterFactory $internalApiLimiter,
        private readonly RateLimiterFactory $redirectionLimiter,
        private readonly RateLimiterFactory $publicApiLimiter,
    ) {}

    #[AsEventListener(priority: 2048)]
    public function onKernelController(ControllerEvent $event): void
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

            $result                    = $limiter->consume($consume_amount);
            $this->rateLimitLimit      = $result->getLimit();
            $this->rateLimitRemaining  = $result->getRemainingTokens();
            $this->rateLimitResetAfter = $result->getRetryAfter()->getTimestamp();
            $this->rateLimitReset      = $this->rateLimitResetAfter - time();

            if (!$result->isAccepted())
            {
                // To be accessed in the error output
                $request->attributes->set('_rate_limit_reset_after', $this->rateLimitResetAfter);
                $code = Response::HTTP_TOO_MANY_REQUESTS;

                throw new HttpException($code, Response::$statusTexts[$code]);
            }
        }
    }

    #[AsEventListener(priority: -1024)]
    public function onResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest())
        {
            return;
        }

        $response = $event->getResponse();
        $response->headers->set('X-RateLimit-Limit', $this->rateLimitLimit);
        $response->headers->set('X-RateLimit-Remaining', $this->rateLimitRemaining);
        $response->headers->set('X-RateLimit-Reset', $this->rateLimitReset);
        $response->headers->set('X-RateLimit-Reset-After', $this->rateLimitResetAfter);
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

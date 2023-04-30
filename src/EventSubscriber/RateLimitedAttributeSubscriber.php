<?php namespace App\EventSubscriber;

use App\Attribute\RateLimited;
use App\Service\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\LimiterInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ControllerArgumentsEvent;

class RateLimitedAttributeSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly RateLimiterFactory $authenticationLimiter,
        private readonly RateLimiterFactory $internalApiLimiter,
        private readonly RateLimiterFactory $publicApiLimiter,
        private readonly ResponseHeaderBag  $headerBag
    ) {}

    /**
     * @inheritDoc
     */
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::CONTROLLER_ARGUMENTS => 'onKernelControllerArguments'];
    }

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
            case 'authentication':
                $limiter = $this->authenticationLimiter;
                break;
        }

        return $limiter?->create($ip);
    }
}

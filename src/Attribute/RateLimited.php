<?php namespace App\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS | Attribute::TARGET_METHOD)]
class RateLimited
{
    /**
     * @param string $configuration The name of the rate limiter as defined in `framework.yaml`
     */
    public function __construct(
        public readonly string $configuration,
        public readonly int $consumeAmount = 1
    ) {}
}

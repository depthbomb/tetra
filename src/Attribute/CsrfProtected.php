<?php namespace App\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS | Attribute::TARGET_METHOD)]
class CsrfProtected
{
    public function __construct(
        public readonly string $tokenId
    ) {}
}

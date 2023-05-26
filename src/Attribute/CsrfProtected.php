<?php namespace App\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS | Attribute::TARGET_METHOD)]
readonly class CsrfProtected
{
    public function __construct(public string $tokenId) {}
}

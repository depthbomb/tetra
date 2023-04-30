<?php namespace App\Twig;

use Twig\TwigFunction;
use App\Service\CspService;
use Twig\Extension\AbstractExtension;

class CspNonceExtension extends AbstractExtension
{
    public function __construct(
        private readonly CspService $csp
    ) {}

    public function getFunctions(): array
    {
        return [
            new TwigFunction('csp_nonce', [$this, 'getCspNonce'])
        ];
    }

    public function getCspNonce(): string
    {
        return $this->csp->getNonce();
    }
}

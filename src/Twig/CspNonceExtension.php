<?php namespace App\Twig;

use Twig\TwigFunction;
use App\Util\CspNonce;
use Twig\Extension\AbstractExtension;

class CspNonceExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('csp_nonce', [$this, 'getCspNonce'])
        ];
    }

    public function getCspNonce(): string
    {
        return CspNonce::getNonce();
    }
}

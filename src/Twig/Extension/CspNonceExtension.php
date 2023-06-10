<?php namespace App\Twig\Extension;

use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;
use App\Twig\Runtime\CspNonceExtensionRuntime;

class CspNonceExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('csp_nonce', [CspNonceExtensionRuntime::class, 'getCspNonce']),
        ];
    }
}

<?php namespace App\Twig\Runtime;

use App\Util\CspNonce;
use Twig\Extension\RuntimeExtensionInterface;

class CspNonceExtensionRuntime implements RuntimeExtensionInterface
{
    public function getCspNonce(): string
    {
        return CspNonce::getNonce();
    }
}

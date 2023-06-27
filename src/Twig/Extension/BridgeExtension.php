<?php namespace App\Twig\Extension;

use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;
use App\Twig\Runtime\BridgeExtensionRuntime;

class BridgeExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_config', [BridgeExtensionRuntime::class, 'getConfig']),
            new TwigFunction('get_user', [BridgeExtensionRuntime::class, 'getUser']),
            new TwigFunction('get_enabled_features', [BridgeExtensionRuntime::class, 'getEnabledFeatures']),
        ];
    }
}

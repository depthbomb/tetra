<?php namespace App\Twig\Extension;

use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;
use App\Twig\Runtime\BridgeExtensionRuntime;

class BridgeExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_bridge', [BridgeExtensionRuntime::class, 'getBridge']),
            new TwigFunction('get_user', [BridgeExtensionRuntime::class, 'getUser']),
        ];
    }
}

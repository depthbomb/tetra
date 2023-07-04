<?php namespace App\Twig\Extension;

use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;
use App\Twig\Runtime\BridgeExtensionRuntime;

class BridgeExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_route_name', [BridgeExtensionRuntime::class, 'getRouteName']),
            new TwigFunction('get_client_ip', [BridgeExtensionRuntime::class, 'getClientIp']),
            new TwigFunction('get_request_id', [BridgeExtensionRuntime::class, 'getRequestId']),
            new TwigFunction('get_user_config', [BridgeExtensionRuntime::class, 'getUserConfig']),
            new TwigFunction('get_enabled_features', [BridgeExtensionRuntime::class, 'getEnabledFeatures']),
        ];
    }
}

<?php namespace App\Twig\Runtime;

use App\Service\BridgeService;
use Twig\Extension\RuntimeExtensionInterface;

class BridgeExtensionRuntime implements RuntimeExtensionInterface
{
    public function __construct(private readonly BridgeService $bridge) {}

    public function getClientIp(): string
    {
        return $this->bridge->getClientIp();
    }

    public function getRouteName(): string
    {
        return $this->bridge->getRouteName();
    }

    public function getRequestId(): string
    {
        return $this->bridge->getRequestId();
    }

    public function getUserConfig(): string
    {
        return $this->bridge->getUserConfig();
    }

    public function getEnabledFeatures(): string
    {
        return $this->bridge->getEnabledFeatures();
    }
}

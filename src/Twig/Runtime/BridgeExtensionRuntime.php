<?php namespace App\Twig\Runtime;

use App\Service\BridgeService;
use Twig\Extension\RuntimeExtensionInterface;

class BridgeExtensionRuntime implements RuntimeExtensionInterface
{
    public function __construct(private readonly BridgeService $bridge) {}

    public function getConfig(): string
    {
        return $this->bridge->getConfig();
    }

    public function getUser(): string
    {
        return $this->bridge->getUserConfig();
    }

    public function getEnabledFeatures(): string
    {
        return $this->bridge->getEnabledFeatures();
    }
}

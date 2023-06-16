<?php namespace App\Twig\Runtime;

use App\Service\BridgeService;
use Twig\Extension\RuntimeExtensionInterface;

readonly class BridgeExtensionRuntime implements RuntimeExtensionInterface
{
    public function __construct(private BridgeService $bridge) {}

    public function getBridge(): string
    {
        return $this->bridge->getConfig();
    }

    public function getUser(): string
    {
        return $this->bridge->getUserConfig();
    }
}

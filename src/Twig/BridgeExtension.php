<?php namespace App\Twig;

use Twig\TwigFunction;
use App\Service\BridgeService;
use Twig\Extension\AbstractExtension;

class BridgeExtension extends AbstractExtension
{
    public function __construct(private readonly BridgeService $bridge) {}

    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_bridge', [$this, 'getBridge']),
            new TwigFunction('get_user', [$this, 'getUser']),
        ];
    }

    public function getBridge(): array
    {
        return $this->bridge->getConfig();
    }

    public function getUser(): array
    {
        return $this->bridge->getUserConfig();
    }
}

<?php namespace App\Twig\Runtime;

use App\Util\Assets;
use Twig\Extension\RuntimeExtensionInterface;

class AssetsExtensionRuntime implements RuntimeExtensionInterface
{
    public function getPreloadAssets(): array
    {
        return Assets::getPreloadAssets();
    }

    public function getJsEntries(): array
    {
        return Assets::getJsEntries();
    }

    public function getCssEntries(): array
    {
        return Assets::getCssEntries();
    }

    public function getVersionedAsset(string $original_name): ?string
    {
        return Assets::getVersionedAsset($original_name);
    }
}

<?php namespace App\Twig;

use App\Util\Assets;
use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;

class AssetsExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_preload_assets', [$this, 'getPreloadAssets']),
            new TwigFunction('get_js_entries', [$this, 'getJsEntries']),
            new TwigFunction('get_css_entries', [$this, 'getCssEntries']),
            new TwigFunction('get_versioned_asset', [$this, 'getVersionedAsset']),
        ];
    }

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

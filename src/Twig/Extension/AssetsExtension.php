<?php namespace App\Twig\Extension;

use Twig\TwigFunction;
use Twig\Extension\AbstractExtension;
use App\Twig\Runtime\AssetsExtensionRuntime;

class AssetsExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_preload_assets', [AssetsExtensionRuntime::class, 'getPreloadAssets']),
            new TwigFunction('get_js_entries', [AssetsExtensionRuntime::class, 'getJsEntries']),
            new TwigFunction('get_css_entries', [AssetsExtensionRuntime::class, 'getCssEntries']),
            new TwigFunction('get_versioned_asset', [AssetsExtensionRuntime::class, 'getVersionedAsset']),
        ];
    }
}

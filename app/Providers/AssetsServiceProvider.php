<?php namespace App\Providers;

use App\Utils\Assets;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AssetsServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot(): void
    {
        Blade::directive('rev', fn(string $path) => Assets::getRevisioned($path, true));
        Blade::directive('asset', fn(string $input) => Assets::getAssetTag($input));
        Blade::directive('modulepreload', fn() => Assets::generateModulePreloadTag());
    }
}

<?php

namespace App\Providers;

use App\Repositories\LinksRepository;
use Illuminate\Support\ServiceProvider;
use App\Repositories\LinksRepositoryInterface;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register(): void
    {
        $this->app->bind(LinksRepositoryInterface::class, LinksRepository::class);
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot(): void
    {
        //
    }
}

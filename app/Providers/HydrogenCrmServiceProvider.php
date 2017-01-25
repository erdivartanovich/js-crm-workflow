<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class HydrogenCrmServiceProvider extends ServiceProvider
{

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // migration
        $this->publishes([
            __DIR__.'/../../resources/hydrogen-crm/database/migrations/' => database_path('migrations'),
            __DIR__.'/../../resources/hydrogen-crm/database/es_migrations/' => database_path('es_migrations'),
            __DIR__.'/../../resources/hydrogen-crm/database/seeds/' => database_path('seeds'),
        ], 'migrations');

        // command
        $this->publishes([
            __DIR__.'/../../resources/hydrogen-crm/app/Console/Commands/' => app_path('Console/Commands')
        ], 'command');
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // register hydrogen-crm additional command
        if (file_exists(app_path('Console').'/Commands/EsCreateIndex.php')) {
            $this->app->singleton('command.es.install', function ($app) {
                return $app['App\Console\Commands\EsCreateIndex'];
            });    
            $this->commands('command.es.install');
        }
        if (file_exists(app_path('Console').'/Commands/EsMigrate.php')) {
            $this->app->singleton('command.es.migrate', function ($app) {
                return $app['App\Console\Commands\EsMigrate'];
            });    
            $this->commands('command.es.migrate');
        }
        if (file_exists(app_path('Console').'/Commands/EsMigrateInstall.php')) {
            $this->app->singleton('command.es.migrate-install', function ($app) {
                return $app['App\Console\Commands\EsMigrateInstall'];
            });    
            $this->commands('command.es.migrate-install');
        }
        if (file_exists(app_path('Console').'/Commands/EsMigration.php')) {
            $this->app->singleton('command.es.make-migration', function ($app) {
                return $app['App\Console\Commands\EsMigration'];
            });    
            $this->commands('command.es.make-migration');
        }
        if (file_exists(app_path('Console').'/Commands/EsReindex.php')) {
            $this->app->singleton('command.es.reindex', function ($app) {
                return $app['App\Console\Commands\EsReindex'];
            });    
            $this->commands('command.es.reindex');
        }
        if (file_exists(app_path('Console').'/Commands/EsRefresh.php')) {
            $this->app->singleton('command.es.refresh', function ($app) {
                return $app['App\Console\Commands\EsRefresh'];
            });    
            $this->commands('command.es.refresh');
        }
    }
}

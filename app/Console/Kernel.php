<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        // Commands\EsCreateIndex::class,
        // Commands\EsMigration::class,
        // Commands\EsMigrateInstall::class,
        // Commands\EsMigrate::class,
        // Commands\EsReindex::class,
        // Commands\EsRefresh::class,
        
        // // Commands\Inspire::class,
        Commands\Workflow\WorkflowAllCommand::class,
        Commands\Workflow\Workflow::class,
        Commands\Workflow\Action::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')
        //          ->hourly();
    }
}

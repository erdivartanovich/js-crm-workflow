<?php

namespace App\Console\Commands\Workflow;

use Illuminate\Console\Command;
use CRMFoundation\Domains\Workflow\Contracts\WorkflowServiceInterface as WorkflowService;
use CRMFoundation\Domains\Workflow\Contracts\RuleServiceInterface as RuleService;
use CRMFoundation\Domains\Workflow\Contracts\LogServiceInterface as LogService;
use CRMFoundation\Domains\Action\Contracts\ActionServiceInterface as ActionService;
use CRMFoundation\Infrastructures\Adapters\SearchAdapterBuilder;

use CRMFoundation\Domains\Workflow\Contracts\LogInterface;
//use CRMFoundation\Infrastructures\Action\AsyncActionRunner;
use Artisan;


class Workflow extends Command
{
        /**
         * The name and signature of the console command.
         *
         * @var string
         */
        protected $signature = 'workflow:run
                                {workflow : ID of workflows}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute automated workflow';


    private $workflowService;
    private $ruleService;
    private $actionService;
    private $logService;
    private $searchAdapterBuilder;
    private $startTime;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(WorkflowService $workflowService, 
        RuleService $ruleService,
        ActionService $actionService,
        LogService $logService,
        SearchAdapterBuilder $searchAdapterBuilder)
    {
        parent::__construct();
        $this->workflowService = $workflowService;
        $this->ruleService = $ruleService;
        $this->actionService = $actionService;
        $this->logService = $logService;
        $this->searchAdapterBuilder = $searchAdapterBuilder;

        $this->startTime = $this->getTime();
    }

    /**
     * Get Current Time
     *
     * @return float time in seconds 
     */
    protected function getTime()
    {
        list($usec, $sec) = explode(" ", microtime());
        return ((float)$usec + (float)$sec);
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $workflow = $this->workflowService->view($this->argument('workflow'));
        $this->info('Processing '. $workflow->name);

        $limit = 1000;
        $adapter = $this->searchAdapterBuilder
            ->setPager($limit, 0, [])
            ->addFilters([])
            ->build();
        $this->info('Fetching actions...');
        $actions = $this->workflowService->listActions($workflow, $adapter);
        $this->info('Got ' . $actions->count() . ' actions. Starting fire actions...');

        //$runner = [];
        $actions->each(function ($action) use ($workflow) {
            $this->info('Fire action '. $action->id .' '. $action->name . '...');
            // $async = new AsyncActionRunner($action->id, $workflow->id);
            // $runner[] = $async;
            // $async->start();

            Artisan::call('workflow:action-run', [
                'action' => $action->getKey(),
                'workflow' => $workflow->getKey(), 
            ]);
        });
        $this->info("Complete fire actions...");
        $endTime = $this->getTime();
        $time = $endTime - $this->startTime;

        $this->info("Complete fire actions in: ".$time);
    }
}

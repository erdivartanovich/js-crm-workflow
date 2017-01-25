<?php

namespace App\Console\Commands\Workflow;

use Illuminate\Console\Command;
use CRMFoundation\Domains\Workflow\Contracts\WorkflowServiceInterface as WorkflowService;
use CRMFoundation\Domains\Workflow\Contracts\RuleServiceInterface as RuleService;
use CRMFoundation\Domains\Workflow\Contracts\LogServiceInterface as LogService;
use CRMFoundation\Domains\Action\Contracts\ActionServiceInterface as ActionService;
use CRMFoundation\Infrastructures\Adapters\SearchAdapterBuilder;

use CRMFoundation\Domains\Workflow\Contracts\LogInterface;


class WorkflowAllCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'workflow:runall
                            {workflow : ID of workflows}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute automated workflow all processes';


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
        $this->info('Fetching objects...');
        $objects = $this->workflowService->listObjects($workflow, $adapter);
        $objects = $objects->count() ? $objects->items() : [];
        $this->info('Got ' . $objects->count() . ' objects.');
        $adapter = $this->searchAdapterBuilder
            ->setSorter(['priority'])
            ->setPager($limit, 0, [])
            ->addFilters([])
            ->build();

        $this->info('Fetching rules...');
        $rules = $this->workflowService->listRules($workflow, $adapter);
        $rules = $rules->count() ? $rules->items() : [];
        $this->info('Got ' . $rules->count() . ' rules.');
        $adapter = $this->searchAdapterBuilder
            ->setPager($limit, 0, [])
            ->addFilters([])
            ->build();
        $this->info('Fetching actions...');
        $actions = $this->workflowService->listActions($workflow, $adapter);
        $this->info('Got ' . $actions->count() . ' actions. Starting fire actions...');
        $actions->each(function ($action) use ($rules, $objects, $workflow) {
            $this->info('Fire action ' . $action->name . '...');
            try {
                $updated = $this->actionService->fireAction($workflow, 
                    $action, $objects, ...$rules->all());
                $this->comment($updated->count() . ' resources updated');

                // do log
                $this->logService->log($workflow, $this->actionService->getExecutor());
                $this->info("Store workflow log ...");
            } catch (\Exception $e) {
                $this->logService->dolog(
                    $workflow, 
                    $action,
                    $rules->all(),
                    LogInterface::LOG_STATUS_FAILED,
                    $e->getMessage()
                );
                $this->info("Store catch error workflow log ...");
            }
        });
        $this->info("Complete fire actions...");
        $endTime = $this->getTime();

        $this->info('QueryLog:');
        foreach (\DB::getQueryLog() as $log) {
            $format = str_replace('?', '%s', $log['query']);
            $this->comment(sprintf($format, ...$log['bindings']));
            $this->info('===============');
        }
        $time = $endTime - $this->startTime;
        $this->info("Complete fire actions in: ".$time);
    }
}

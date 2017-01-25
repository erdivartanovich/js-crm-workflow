<?php
namespace App\Console\Commands\Workflow;

use Illuminate\Console\Command;
use CRMFoundation\Domains\Workflow\Contracts\WorkflowServiceInterface as WorkflowService;
use CRMFoundation\Domains\Workflow\Contracts\RuleServiceInterface as RuleService;
use CRMFoundation\Domains\Action\Contracts\ActionServiceInterface as ActionService;
use CRMFoundation\Infrastructures\Adapters\SearchAdapterBuilder;
use CRMFoundation\Domains\Workflow\Contracts\WorkflowInterface;
use CRMFoundation\Domains\Action\Contracts\ActionInterface;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Collection;

class Action extends Command
{

    private $workflowService;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'workflow:action-run
        {action : ID of action}
        {workflow : ID of workflow}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute automated workflow action';


    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(WorkflowService $workflowService,
        RuleService $ruleService,
        ActionService $actionService,
        SearchAdapterBuilder $searchAdapterBuilder)
    {
        parent::__construct();
        $this->workflowService = $workflowService;
        $this->ruleService = $ruleService;
        $this->actionService = $actionService;
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

    public function handleRuleActionWorkflow(WorkflowInterface $workflow, ActionInterface $action)
    {
        $rule = $this->ruleService->getRuleThatHasAction($workflow, $action);
        if (!$rule) {
            return $this->fail();
        }

        return $this->fireActions($workflow, $action, $this->pullObjects($workflow), new Collection([$rule]));
    }

    private function fail()
    {
        $this->info('Invalid action workflow provided!');
        return 1;
    }

    private function pullObjects(WorkflowInterface $workflow)
    {
        // fetching objects...
        $adapter = $this->searchAdapterBuilder
            ->setPager(1000, 0, [])
            ->addFilters([])
            ->build();
        $this->info('Fetching objects...');
        $objects = $this->workflowService->listObjects($workflow, $adapter);
        $objects = count($objects)? $objects->items() : new Collection;
        $this->info('Got ' . count($objects) . ' objects.');

        return $objects;
    }

    private function fireActions($workflow, $action, $objects, $rules)
    {

        // fire action
        $this->info('Fire action ' . $action->getName() . '...');

        $updated = $this->actionService->fireAction($workflow,
                        $action, $objects, ...$rules->all());

        $this->info("Complete fire actions...");
        $endTime = $this->getTime();
        $time = $endTime - $this->startTime;
        $this->printQueryLog();
        $this->info("Complete fire actions in: ".$time);


    }

    private function startQueryLog()
    {
        \DB::enableQueryLog();
    }

    private function printQueryLog()
    {
        $this->info('QueryLog:');
        foreach (\DB::getQueryLog() as $log) {
            $format = str_replace('?', '%s', $log['query']);
            $this->comment(sprintf($format, ...$log['bindings']));
            $this->info('===============');
        }
        \DB::flushQueryLog();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->startQueryLog();
        $workflow = $this->workflowService->view($this->argument('workflow'));

        $suspectAction = $this->actionService->get($this->argument('action'));
        $action = $this->actionService->getActionWorkflow($workflow, $suspectAction);

        // check valid action workflow
        if (!$action) {
            $this->info('action workflow not found!');
            $this->info('Now checking for rule action type workflows');
            return $this->handleRuleActionWorkflow($workflow, $suspectAction);
        }

        $this->info('Processing '. $workflow->getName());
        $limit = 1000;

        $objects = $this->pullObjects($workflow);

        // fetching rules
        $adapter = $this->searchAdapterBuilder
            ->setSorter(['priority'])
            ->setPager($limit, 0, [])
            ->addFilters([])
            ->build();

        $this->info('Fetching rules...');

        // workflow actions
        $rules = $this->workflowService->listRules($workflow, $adapter);
        $rules = count($rules)? $rules->items() : new Collection;
        $this->info('Got ' . count($rules) . ' rules.');
        $this->printQueryLog();
        return $this->fireActions($workflow, $action, $objects, $rules);
    }

}

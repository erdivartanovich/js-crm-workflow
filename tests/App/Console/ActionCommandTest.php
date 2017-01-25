<?php

namespace Test\App\Console;

use Test\CommandTestCase;
use App\Console\Commands\Workflow\Action as ActionCommand;

use CRMFoundation\Domains\Workflow\Contracts\WorkflowInterface;
use CRMFoundation\Domains\Workflow\Contracts\RuleInterface;
use CRMFoundation\Domains\Workflow\Contracts\LogInterface;
use CRMFoundation\Domains\Action\Contracts\ActionInterface;
use CRMFoundation\Domains\Workflow\Contracts\WorkflowServiceInterface as WorkflowService;
use CRMFoundation\Domains\Workflow\Contracts\RuleServiceInterface as RuleService;
use CRMFoundation\Domains\Action\Contracts\ActionServiceInterface as ActionService;
use CRMFoundation\Domains\Workflow\Contracts\LogRepositoryInterface;
use CRMFoundation\Infrastructures\Adapters\SearchAdapterBuilder;
use CRMFoundation\Infrastructures\Adapters\SearchAdapter;

use CRMFoundation\Domains\User\UserEloquent;
use CRMFoundation\Domains\Person\PersonEloquent;
use CRMFoundation\Domains\Person\PersonEmailEloquent;
use CRMFoundation\Domains\Person\PersonPhoneEloquent;
use CRMFoundation\Domains\Workflow\RuleEloquent;
use CRMFoundation\Domains\Workflow\LogEloquent;
use CRMFoundation\Domains\Workflow\WorkflowEloquent;
use CRMFoundation\Domains\Workflow\ObjectEloquent;
use CRMFoundation\Domains\Action\ActionEloquent;
use CRMFoundation\Domains\Tag\TagEloquent;
use CRMFoundation\Domains\Task\TaskEloquent;
use CRMFoundation\Domains\Person\PersonContextEloquent;
use CRMFoundation\Domains\Person\LeadTypeEloquent;
use CRMFoundation\Domains\Stage\StageEloquent;
use CRMFoundation\Observers\PersonObserver;


use Symfony\Component\Console\Application;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Illuminate\Contracts\Console\Kernel;

use Illuminate\Support\Collection;
use Mockery as m;
use KWApi\KWApi;
use KWApi\Services\PeopleService;
use KWApi\Services\DemographicService;
use KWApi\Models\Response as KWApiResponse;


class ActionCommandTest extends CommandTestCase
{

    /**
     * setUp
     */
    protected function setUp()
    {
        parent::setUp();

        // person, user, and target
        $this->leadTypeId = LeadTypeEloquent::where('label', 'own')->where('user_id', null)->first()->getKey();
        $this->stageId = StageEloquent::where('label', 'lead')->where('user_id', null)->first()->getKey();
        $this->user = factory(UserEloquent::class)->create();
        $this->person = factory(PersonEloquent::class)->create([
            'is_pre_approved' => 1,
            'is_primary' => 1,
            'user_id' => $this->user->getKey(),
            'stage_id' => $this->stageId,
            'lead_type_id' => $this->leadTypeId,
        ]);
        
        $this->tag = factory(TagEloquent::class)->create(['tag'=>'detach_tag']); // random tag
        $this->tag2 = factory(TagEloquent::class)->create(['tag'=>'attach_tag']); // random tag
        $this->person->tags()->attach($this->tag->getKey(), ['user_id' => $this->user->getKey()]);
        $this->email = factory(PersonEmailEloquent::class)->create([
            'person_id' => $this->person->getKey(),
            'is_primary' => 1,
        ]);
        $this->phone = factory(PersonPhoneEloquent::class)->create([
            'person_id' => $this->person->getKey(),
            'number' => '+6281460000109',
            'is_primary' => 1,
        ]);

        $this->logRepositories = app()->make(LogRepositoryInterface::class);
    }

    /**
     * Test action command with mock
     */
    public function testActionCommand()
    {
        $workflowService = m::mock(WorkflowService::class);
        $ruleService = m::mock(RuleService::class);
        $actionService = m::mock(ActionService::class);
        $searchAdapterBuilder = m::mock(SearchAdapterBuilder::class);
        $workflow = m::mock(WorkflowInterface::class);
        $collection = m::mock(Collection::class);
        $adapter = m::mock(SearchAdapter::class);
        $action = m::mock(ActionInterface::class);
        $rule = m::mock(RuleInterface::class);

        //$application = new Application();
        $workflowService->shouldReceive('view')->with(1)->andReturn($workflow)
            ->shouldReceive('listObjects')->with($workflow,$adapter)->andReturn($collection)
            ->shouldReceive('listRules')->with($workflow,$adapter)->andReturn($collection);
        $collection->shouldReceive('count')->andReturn(2)
            ->shouldReceive('items')->andReturn($collection)
            ->shouldReceive('getIterator')->andReturn(new \ArrayIterator([$rule]))
            ->shouldReceive('all')->andReturn([$rule]);
        $workflow->shouldReceive('getName')->andReturn('workflow');
        $searchAdapterBuilder->shouldReceive('setSorter')->with(['priority'])->andReturn($searchAdapterBuilder)
            ->shouldReceive('setPager')->with(1000,0,[])->andReturn($searchAdapterBuilder)
            ->shouldReceive('addFilters')->with([])->andReturn($searchAdapterBuilder)
            ->shouldReceive('build')->andReturn($adapter);
        $actionService->shouldReceive('get')->with(2)->andReturn($action)
            ->shouldReceive('getActionWorkflow')->with($workflow,$action)->andReturn($action)
            ->shouldReceive('fireAction')->with($workflow, $action, $collection, ...$collection);
        $action->shouldReceive('getName')->andReturn('action');

        $command = new ActionCommand($workflowService, $ruleService, $actionService, $searchAdapterBuilder);

        $command->setLaravel($this->app->make('Illuminate\Contracts\Foundation\Application'));
        $command->setApplication($this->app->make('Symfony\Component\Console\Application'));

        $output = new BufferedOutput;
        $result = $command->run(new ArrayInput([
            'workflow' => 1,
            'action' => 2,
        ]),$output);


        $this->assertEquals(1, preg_match('/^Complete fire actions/m', $output->fetch()));
    }

    /**
     * Test Action command use case 1
     * workflow with rules and actions, don't have dependency rules
     * without objects
     */
    public function testActionUseCase1()
    {
        // person data

        // workflow data
        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $this->user->getKey()
        ]);
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'is preapprove person',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_BOOLEAN,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'persons.is_pre_approved',
            'value' => '1',
        ]);

        $rule2 = factory(RuleEloquent::class)->create([
            'name' => 'lead type rent',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.lead_type_id',
            'value' => $this->leadTypeId,
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_UPDATE,
            'target_class' => 'persons',
            'target_field' => 'is_primary',
            'value' => 1,
        ]);
        app(WorkflowService::class)->syncActions($workflow, $action1);


        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );

echo $output->fetch();
        $this->assertEquals($status, 0);
        //$this->assertEquals(1, preg_match('/^Complete fire actions/m', $output->fetch()));
        $this->seeInDatabase('persons',[
            'id' => $this->person->getKey(),
            'is_primary' => 1,
        ]);


        // TODO: check to ES action_logs
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $this->person->getLoggableType(),
            'object_id' => $this->person->getKey(),
        ]);
        $this->seeInDatabase('action_log_rules',[
            'rule_id' => $rule1->getKey()
        ]);
        $this->seeInDatabase('action_log_rules',[
            'rule_id' => $rule2->getKey()
        ]);

        //cleanup.
        $this->cleanUpRecords(new PersonObserver, $this->person);
    }

    /**
     * Test action command use case not found resources
     * workflow with rule and actions, having runonce rule
     */
    public function testActionUseCaseNotFound()
    {
        $workflow = factory(WorkflowEloquent::class)->create();
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'is preapprove person',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_BOOLEAN,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'persons.is_pre_approved',
            'value' => '1',
        ]);
        $leadTypeId = LeadTypeEloquent::where('label', 'own')->where('user_id', null)->first()->getKey();
        $rule2 = factory(RuleEloquent::class)->create([
            'name' => 'lead type own',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.lead_type_id',
            'value' => $leadTypeId,
        ]);
        $rule3 = factory(RuleEloquent::class)->create([
            'name' => 'imposible rule',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'persons.id',
            'value' => 0,
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_UPDATE,
            'target_class' => 'persons',
            'target_field' => 'is_primary',
            'value' => 1,
        ]);
        $workflow->actions()->sync([$action1->getKey()]);

        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );

        $this->assertEquals($status, 0);
        $this->assertEquals(1, preg_match('/^Complete fire actions/m', $output->fetch()));
        // check logs
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_FAILED,
            'object_class' => null,
            'object_id' => null,
        ]);
        $this->seeInDatabase('action_log_rules',[
            'rule_id' => $rule1->getKey()
        ]);
        $this->seeInDatabase('action_log_rules',[
            'rule_id' => $rule2->getKey()
        ]);
        $this->seeInDatabase('action_log_rules',[
            'rule_id' => $rule3->getKey()
        ]);
    }

    /**
     * Test action command use case 2
     * workflow with rule and actions, having runonce rule
     * with object.
     */
    public function testActionUseCase2()
    {
        // person and target

        // workflow, rule and action
        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $this->user->getKey(),
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_UPDATE,
            'target_class' => 'persons',
            'target_field' => 'is_primary',
            'value' => 1,
        ]);
        $workflow->actions()->sync([$action1->getKey()]);
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'is preapprove person',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_BOOLEAN,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'persons.is_pre_approved',
            'value' => '1',
            'runnable_once' => true,
            'run_interval' => 0,
        ]);
        $rule2 = factory(RuleEloquent::class)->create([
            'name' => 'lead type own',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.lead_type_id',
            'value' => $this->leadTypeId,
        ]);

        $action1->rules()->sync([ $rule1->getKey(), $rule2->getKey()]); //

        $object = factory(ObjectEloquent::class)->create([
            'workflow_id' => $workflow->getKey(),
            'object_class' => 'tags.id',
            'object_type' => $this->tag->getKey(),
        ]);
        // check tag
        $this->seeInDatabase('taggables',[
            'user_id' => $this->user->getKey(),
            'tag_id' => $this->tag->getKey(),
            'taggable_id' => $this->person->getKey(),
            'taggable_type' => 'persons',
        ]);

        //// first time run ////
        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );
        $this->assertEquals($status, 0);
        //$this->assertEquals(1, preg_match('/^Complete fire actions/m', $output->fetch()));

        // check logs
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $this->person->getLoggableType(),
            'object_id' => $this->person->getKey(),
        ]);
        $this->seeInDatabase('action_log_rules',[
            'rule_id' => $rule1->getKey()
        ]);
        $this->seeInDatabase('action_log_rules',[
            'rule_id' => $rule2->getKey()
        ]);

        //// second run must failed ////
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );
        //echo $output->fetch();
        $this->assertEquals($status, 0);

        // // check logs
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_FAILED,
            'object_class' => $this->person->getLoggableType(),
            'object_id' => $this->person->getKey(),
            'info' => 'Already run once!',
        ]);
        $this->seeInDatabase('action_log_rules',[
            'rule_id' => $rule1->getKey()
        ]);
        $this->seeInDatabase('action_log_rules',[
            'rule_id' => $rule2->getKey()
        ]);

        //cleanup.
        $this->cleanUpRecords(new PersonObserver, $this->person);
    }

    /**
     * Test action command use case 3
     * workflow with rules and actions, that has dependency rules
     */
    public function testActionUseCase3()
    {

        // person, user, and target
        $user = factory(UserEloquent::class)->create();
        $person = factory(PersonEloquent::class)->create([
            'is_pre_approved' => 0,
            'is_primary' => 0,
        ]);
        $leadTypeId = LeadTypeEloquent::where('label', 'own')->where('user_id', null)->first()->getKey();
        $stageId = StageEloquent::where('label', 'prospect')->where('user_id', null)->first()->getKey();
        $stageLeadId = StageEloquent::where('label', 'lead')->where('user_id', null)->first()->getKey();
        $leadContext = factory(PersonContextEloquent::class)->create([
            'user_id' => $user->getKey(),
            'person_id' => $person->getKey(),
            'stage_id' => $stageId,
            'lead_type_id' => $leadTypeId,
        ]);
        $tag = TagEloquent::find(10);
        $person->tags()->attach($tag->getKey(), ['user_id' => $user->getKey()]);

        // workflow, rule, action and object
        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $user->getKey(),
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_UPDATE,
            'target_class' => 'persons',
            'target_field' => 'is_pre_approved',
            'value' => '1',
        ]);
        $action2 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_UPDATE,
            'target_class' => 'person_contexts',
            'target_field' => 'stage_id',
            'value' => $stageLeadId,
        ]);
        $workflow->actions()->sync([$action1->getKey(), $action2->getKey()]); //
        $object = factory(ObjectEloquent::class)->create([
            'workflow_id' => $workflow->getKey(),
            'object_class' => 'tags.id',
            'object_type' => $tag->getKey(),
        ]);


        // // parent rule
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'not preapprove person',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_BOOLEAN,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'persons.is_pre_approved',
            'value' => '0'
        ]);

        // dependent rule
        $rule2 = factory(RuleEloquent::class)->create([
            'name' => 'is prospect person',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.stage_id',
            'value' => $stageId,
            'parent_id' => $rule1->getKey(),
        ]);
        $action1->rules()->sync([ $rule1->getKey()]);
        $action2->rules()->sync([ $rule2->getKey()]);



        //// first time run ////
        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action2->getKey(),
            )),
            $output = new BufferedOutput
        );
        //echo $output->fetch();
        $this->assertEquals($status, 0);

        //// check should failed /////
        $this->seeInDatabase('action_logs',[
            'action_id' => $action2->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_FAILED,
            'object_class' => $person->getLoggableType(), //$leadContext->getLoggableType(),
            'object_id' => $person->getKey(), //$leadContext->getKey(),
            'info' => 'Dependent rule(s) not meet!',
        ]);
        $this->notSeeInDatabase('person_contexts',[
            'id' => $leadContext->getKey(),
            $action2->target_field => $action2->value,
        ]);

        //// second run, run action 1 first /////
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );
        $this->assertEquals($status, 0);
        //echo $output->fetch();

        // check status
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $person->getLoggableType(),
            'object_id' => $person->getKey(),
        ]);
        // check updated by status
        $this->seeInDatabase('persons',[
            'id' => $person->getKey(),
            $action1->target_field => $action1->value,
        ]);

        //// second run, run action 2 then ///
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action2->getKey(),
            )),
            $output = new BufferedOutput
        );
        //echo $output->fetch();
        $this->assertEquals($status, 0);

        // check status
        $this->seeInDatabase('action_logs',[
            'action_id' => $action2->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $person->getLoggableType(), //$leadContext->getLoggableType(),
            'object_id' => $person->getKey(), //$leadContext->getKey(),
        ]);
        // check updated by status
        $this->seeInDatabase('person_contexts',[
            'id' => $leadContext->getKey(),
            $action2->target_field => $action2->value,
        ]);

        $this->cleanUpRecords(new PersonObserver, $person);
    }

    /**
     *
     */
    public function testSocialAppend()
    {
        // workflow, rule, action and object
        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $this->user->getKey(),
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_EXECUTE,
            'target_class' => 'social_append',
            'target_field' => 'crawlPerson',
            'value' => '',
        ]);
        $workflow->actions()->sync([$action1->getKey() ]); //, $action2->getKey()
        $object = factory(ObjectEloquent::class)->create([
            'workflow_id' => $workflow->getKey(),
            'object_class' => 'tags.id',
            'object_type' => $this->tag->getKey(),
        ]);


        // rule
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'do social_append on new lead',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.stage_id',
            'value' => $this->stageId,
            'runnable_once' => 1,
        ]);

        $action1->rules()->sync([ $rule1->getKey()]);

        $resp = [
            'status'=>200,
            'likelihood'=>0.9,
            'requestId'=>'773e6782-62bb-4fc6-9f38-28ea0b5db261',
            'socialProfiles'=>[
                [
                    'typeId'=>'twitter',
                    'typeName'=>'Twitter',
                    'url'=>'http://www.twitter.com/bartlorang',
                    'id'=>5998422,
                    'username'=>'lorangb',
                    'followers'=>631,
                    'following'=>485,
                ],
            ],
            'photos'=>[
                [
                    'url'=>'https://d2ojpxxtu63wzl.cloudfront.net/static/'.
'ecf57683e2c22abb296f822377597290_fe346265298c3d008a4af9c54483809f55508dd4c238789dc9a115ae8395c381',
                    'typeId'=>'twitter',
                    'typeName'=>'Twitter',
                ]
            ]
        ];

        $resp2 = [
            'datafinder'=> [
                'num-results'=> 1,
                'results'=>[
                    [
                        'Phone'=>'+6285778275565',
                        'DOB'=>'19781005',
                        'MaritalStatusInHousehold'=>'Single',
                        'Address'=>'555 10th st',
                    ]
                ]
            ]
        ];

        $email = factory(PersonEmailEloquent::class)->make([
                'email'=>'bart@fullcontact.com',
            ]);
        $this->person->emails()->save($email);

        // setup mock kwapi
        $api = m::mock(KWApi::class);
        $peopleService = m::mock(PeopleService::class);
        $demographicService = m::mock(DemographicService::class);
        $kwAPIResp = m::mock(KWApiResponse::class);
        $kwAPIResp2 = m::mock(KWApiResponse::class);

        $this->app->instance(KWApi::class,$api);

        $api->shouldReceive('people')->andReturn($peopleService)
             ->shouldReceive('demographic')->andReturn($demographicService);

        $peopleService->shouldReceive('lookupEmail')->andReturn($kwAPIResp); //->with($email->getEmail())
        $demographicService->shouldReceive('getDemographics')->andReturn($kwAPIResp2);

        $kwAPIResp->shouldReceive('getBody')->andReturn($resp)
            ->shouldReceive('getStatusCode')->andReturn(200)
            ->shouldReceive('getCause')->andReturn('');
        $kwAPIResp2->shouldReceive('getBody')->andReturn($resp2)
            ->shouldReceive('getStatusCode')->andReturn(200)
            ->shouldReceive('getCause')->andReturn('');

        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );

        $this->assertEquals($status, 0);

        // check status
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $this->person->getLoggableType(), //$leadContext->getLoggableType(),
            'object_id' => $this->person->getKey(), //$leadContext->getKey(),
            'user_id' => $this->user->getKey(),
        ]);

        $this->cleanUpRecords(new PersonObserver, $this->person);
    }

    /**
     * test action send email
     */
    public function testSendEmail()
    {
        // workflow, rule, action and object
        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $this->user->getKey(),
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_EXECUTE,
            'target_class' => 'mailer',
            'target_field' => 'send',
            'value' => '',
        ]);
        $workflow->actions()->sync([$action1->getKey() ]); //, $action2->getKey()
        $object = factory(ObjectEloquent::class)->create([
            'workflow_id' => $workflow->getKey(),
            'object_class' => 'tags.id',
            'object_type' => $this->tag->getKey(),
        ]);


        // rule
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'do email to client person',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.stage_id',
            'value' => $this->stageId,
            'runnable_once' => 1, // only once
        ]);

        $action1->rules()->sync([ $rule1->getKey()]);

        // run action runner
        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );
        //echo $output->fetch();
        $this->assertEquals($status, 0);

        // check status
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $this->person->getLoggableType(), //$leadContext->getLoggableType(),
            'object_id' => $this->person->getKey(), //$leadContext->getKey(),
            'user_id' => $this->user->getKey(),
        ]);

        $this->cleanUpRecords(new PersonObserver, $this->person);
    }

    /**
     * test action assign task
     */
    public function testAssignTask()
    {
        // workflow, rule, action and object
        $this->task = factory(TaskEloquent::class)->create([
            'user_id' => null,
            'person_id' => null,
        ]);

        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $this->user->getKey(),
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_ASSIGN,
            'target_class' => '',
            'target_field' => '',
            'value' => '',
            'task_id' =>$this->task->getKey(),
        ]);
        $workflow->actions()->sync([$action1->getKey() ]); //, $action2->getKey()
        $object = factory(ObjectEloquent::class)->create([
            'workflow_id' => $workflow->getKey(),
            'object_class' => 'tags.id',
            'object_type' => $this->tag->getKey(),
        ]);


        // rule
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'assign task to user',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.stage_id',
            'value' => $this->stageId,
            'runnable_once' => 1, // only once
        ]);

        $action1->rules()->sync([ $rule1->getKey()]);

        // run action runner
        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );
        //echo $output->fetch();
        $this->assertEquals($status, 0);

        // check status
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $this->person->getLoggableType(), //$leadContext->getLoggableType(),
            'object_id' => $this->person->getKey(), //$leadContext->getKey(),
            'user_id' => $this->user->getKey(),
        ]);

        // check task
        $this->seeInDatabase('tasks',[
            'id' => $this->task->getKey(),
            'user_id' => $this->user->getKey(),
        ]);

        $this->cleanUpRecords(new PersonObserver, $this->person);
    }

    /**
     * test action clone task
     */
    public function testCloneTask()
    {
        // workflow, rule, action and object
        $this->task = factory(TaskEloquent::class)->create([
            'user_id' => null,
            'person_id' => $this->person->getKey(),
        ]);

        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $this->user->getKey(),
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_CLONE,
            'target_class' => '',
            'target_field' => '',
            'value' => '',
            'task_id' =>$this->task->getKey(),
        ]);
        $workflow->actions()->sync([$action1->getKey() ]); //, $action2->getKey()
        $object = factory(ObjectEloquent::class)->create([
            'workflow_id' => $workflow->getKey(),
            'object_class' => 'tags.id',
            'object_type' => $this->tag->getKey(),
        ]);


        // rule
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'assign task to user',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.stage_id',
            'value' => $this->stageId,
            'runnable_once' => 1, // only once
        ]);

        $action1->rules()->sync([ $rule1->getKey()]);

        // run action runner
        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );
        //echo $output->fetch();
        $this->assertEquals($status, 0);

        // check status
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $this->person->getLoggableType(), //$leadContext->getLoggableType(),
            'object_id' => $this->person->getKey(), //$leadContext->getKey(),
            'user_id' => $this->user->getKey(),
        ]);

        // check task
        $this->seeInDatabase('tasks',[
            'user_id' => $this->user->getKey(),
            'person_id' => $this->person->getKey(),
            'created_by' => $this->user->getKey(),
            'updated_by' => $this->user->getKey(),
        ]);

        $this->cleanUpRecords(new PersonObserver, $this->person);
    }


    /**
     * test action send text
     */
    public function testSendText()
    {
        // workflow, rule, action and object
        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $this->user->getKey(),
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_EXECUTE,
            'target_class' => 'sms',
            'target_field' => 'sendPrimary',
            'value' => 'Greetings from KW!',
        ]);
        $workflow->actions()->sync([$action1->getKey() ]); //, $action2->getKey()
        $object = factory(ObjectEloquent::class)->create([
            'workflow_id' => $workflow->getKey(),
            'object_class' => 'tags.id',
            'object_type' => $this->tag->getKey(),
        ]);


        // rule
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'do email to client person',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.stage_id',
            'value' => $this->stageId,
            'runnable_once' => 1, // only once
        ]);

        $action1->rules()->sync( [ $rule1->getKey() ] );

        // run action runner
        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );
        //echo $output->fetch();
        $this->assertEquals($status, 0);

        // check status
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $this->person->getLoggableType(), //$leadContext->getLoggableType(),
            'object_id' => $this->person->getKey(), //$leadContext->getKey(),
            'user_id' => $this->user->getKey(),
        ]);

        $this->cleanUpRecords(new PersonObserver, $this->person);
    }


    /**
     * test action attach tag 
     */
    public function testTagAttach()
    {
        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $this->user->getKey(),
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_EXECUTE,
            'target_class' => 'tagger',
            'target_field' => 'attach',
            'value' => 'attach_tag',
        ]);
        $workflow->actions()->sync([$action1->getKey() ]); //, $action2->getKey()
        $object = factory(ObjectEloquent::class)->create([
            'workflow_id' => $workflow->getKey(),
            'object_class' => 'tags.id',
            'object_type' => $this->tag->getKey(),
        ]);

        
        // rule
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'tag person',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.stage_id',
            'value' => $this->stageId,
            'runnable_once' => 1, // only once
        ]);

        $action1->rules()->sync([ $rule1->getKey()]);

        // run action runner
        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );
        //echo $output->fetch();
        $this->assertEquals($status, 0);

        // check status
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $this->person->getLoggableType(), //$leadContext->getLoggableType(),
            'object_id' => $this->person->getKey(), //$leadContext->getKey(),
            'user_id' => $this->user->getKey(),
        ]);

        // check tag
        $this->seeInDatabase('taggables',[
            'user_id' => $this->user->getKey(),
            'tag_id' => $this->tag2->getKey(),
            'taggable_id' => $this->person->getKey(),
            'taggable_type' => 'persons',
        ]);
        
        $this->cleanUpRecords(new PersonObserver, $this->person);
    }

    /**
     * test action detach tag 
     */
    public function testTagDetach()
    {
        $workflow = factory(WorkflowEloquent::class)->create([
            'user_id' => $this->user->getKey(),
        ]);
        $action1 = factory(ActionEloquent::class)->create([
            'action_type' => ActionEloquent::ACTION_TYPE_EXECUTE,
            'target_class' => 'tagger',
            'target_field' => 'detach',
            'value' => 'detach_tag',
        ]);
        $workflow->actions()->sync([$action1->getKey() ]); //, $action2->getKey()
        $object = factory(ObjectEloquent::class)->create([
            'workflow_id' => $workflow->getKey(),
            'object_class' => 'tags.id',
            'object_type' => $this->tag->getKey(),
        ]);

        
        // rule
        $rule1 = factory(RuleEloquent::class)->create([
            'name' => 'detach tag person',
            'workflow_id' => $workflow->getKey(),
            'rule_type' => RuleEloquent::FIELD_TYPE_NUMBER,
            'operator' => RuleEloquent::OPERATOR_EQUAL,
            'field_name' => 'person_contexts.stage_id',
            'value' => $this->stageId,
            'runnable_once' => 1, // only once
        ]);

        $action1->rules()->sync([ $rule1->getKey()]);

        // run action runner
        $kernel = $this->app->make(Kernel::class);
        $status = $kernel->handle(
            $input = new ArrayInput(array(
                'command'      => 'workflow:action-run',
                'workflow'     => $workflow->getKey(),
                'action'       => $action1->getKey(),
            )),
            $output = new BufferedOutput
        );
        //echo $output->fetch();
        $this->assertEquals($status, 0);

        // check status
        $this->seeInDatabase('action_logs',[
            'action_id' => $action1->getKey(),
            'workflow_id' => $workflow->getKey(),
            'status' => LogInterface::LOG_STATUS_SUCCESS,
            'object_class' => $this->person->getLoggableType(), //$leadContext->getLoggableType(),
            'object_id' => $this->person->getKey(), //$leadContext->getKey(),
            'user_id' => $this->user->getKey(),
        ]);

        // check tag
        $this->notSeeInDatabase('taggables',[
            'user_id' => $this->user->getKey(),
            'tag_id' => $this->tag->getKey(),
            'taggable_id' => $this->person->getKey(),
            'taggable_type' => 'persons',
        ]);
        
        $this->cleanUpRecords(new PersonObserver, $this->person);
    }

    /**
     * test workflow seeder action promote-hot-lead 
     */
    public function testWorkflowSeeder1()
    {
        $user = UserEloquent::find(1);
        $workflow = WorkflowEloquent::where('user_id',$user->id)->where('name','promote-hot-lead')
            ->whereNull('deleted_at')->get()->first();
        $actions = $workflow->getActions();
        $tag = TagEloquent::whereNull('deleted_at')->where('tag', 'hot')->first();

        // send text
        // send mail
        // tag person with hot tag

        // create person test
        $person = factory(PersonEloquent::class)->create([
            'date_of_birth' => '1994-12-10',
        ]);
        $leadContext = factory(PersonContextEloquent::class)->create([
            'user_id' => $user->getKey(),
            'person_id' => $person->getKey(),
            'stage_id' => $this->stageId,
            'lead_type_id' => $this->leadTypeId,
        ]);
        $phone = factory(PersonPhoneEloquent::class)->create([
            'person_id' => $person->getKey(),
            'number' => '+6281460000109',
            'is_primary' => 1,
        ]);
        $email = factory(PersonEmailEloquent::class)->create([
            'person_id' => $person->getKey(),
            'is_primary' => 1,
        ]);


        foreach ($actions as $action) {
            //var_dump($workflow->id,$action->id);

            // run action runner
            $kernel = $this->app->make(Kernel::class);
            $status = $kernel->handle(
                $input = new ArrayInput(array(
                    'command'      => 'workflow:action-run',
                    'workflow'     => $workflow->getKey(),
                    'action'       => $action->getKey(),
                )),
                $output = new BufferedOutput
            );
            //echo $output->fetch();
            $this->assertEquals($status, 0);

            // check status
            $this->seeInDatabase('action_logs',[
                'action_id' => $action->getKey(),
                'workflow_id' => $workflow->getKey(),
                'status' => LogInterface::LOG_STATUS_SUCCESS,
                'object_class' => $person->getLoggableType(), 
                'object_id' => $person->getKey(), 
                'user_id' => $user->getKey(),
            ]);
        }

        // check tag
        $this->seeInDatabase('taggables',[
            'user_id' => $user->getKey(),
            'tag_id' => $tag->getKey(),
            'taggable_id' => $person->getKey(),
            'taggable_type' => 'persons',
        ]);

        //cleanup.
        $this->cleanUpRecords(new PersonObserver, $person);
    }

    /**
     * test workflow seeder action promote-cold-lead
     */
    public function testWorkflowSeeder2()
    {
        $user = UserEloquent::find(1);
        $workflow = WorkflowEloquent::where('user_id',$user->id)->where('name','promote-cold-lead')
            ->whereNull('deleted_at')->get()->first();
        $actions = $workflow->getActions();
        $tag = TagEloquent::whereNull('deleted_at')->where('tag', 'cold')->first();

        // send text
        // send mail
        // tag person with hot tag

        // create person test
        $person = factory(PersonEloquent::class)->create([
            'date_of_birth' => '1992-01-14',
        ]);
        $leadContext = factory(PersonContextEloquent::class)->create([
            'user_id' => $user->getKey(),
            'person_id' => $person->getKey(),
            'stage_id' => $this->stageId,
            'lead_type_id' => $this->leadTypeId,
        ]);
        $phone = factory(PersonPhoneEloquent::class)->create([
            'person_id' => $person->getKey(),
            'number' => '+6281460000109',
            'is_primary' => 1,
        ]);
        $email = factory(PersonEmailEloquent::class)->create([
            'person_id' => $person->getKey(),
            'is_primary' => 1,
        ]);


        foreach ($actions as $action) {
            //var_dump($workflow->id,$action->id);

            // run action runner
            $kernel = $this->app->make(Kernel::class);
            $status = $kernel->handle(
                $input = new ArrayInput(array(
                    'command'      => 'workflow:action-run',
                    'workflow'     => $workflow->getKey(),
                    'action'       => $action->getKey(),
                )),
                $output = new BufferedOutput
            );
            //echo $output->fetch();
            $this->assertEquals($status, 0);

            // check status
            $this->seeInDatabase('action_logs',[
                'action_id' => $action->getKey(),
                'workflow_id' => $workflow->getKey(),
                'status' => LogInterface::LOG_STATUS_SUCCESS,
                'object_class' => $person->getLoggableType(), 
                'object_id' => $person->getKey(), 
                'user_id' => $user->getKey(),
            ]);
        }

        // check tag
        $this->seeInDatabase('taggables',[
            'user_id' => $user->getKey(),
            'tag_id' => $tag->getKey(),
            'taggable_id' => $person->getKey(),
            'taggable_type' => 'persons',
        ]);

        //cleanup.
        $this->cleanUpRecords(new PersonObserver, $person);
    }

    /**
     * test workflow seeder action task-for-hot-lead
     */
    public function testWorkflowSeeder3()
    {
        $user = UserEloquent::find(1);
        $workflow = WorkflowEloquent::where('user_id',$user->id)->where('name','task-for-hot-lead')
            ->whereNull('deleted_at')->get()->first();
        $actions = $workflow->getActions();
        $tag = TagEloquent::whereNull('deleted_at')->where('tag', 'hot')->first();
        $tasks = TaskEloquent::whereNull('deleted_at')->take(2)->get();
        $hotTaskId = $tasks[0]->id;
        $coldTaskId = $tasks[1]->id;

        // send text
        // send mail
        // tag person with hot tag

        // create person test
        $person = factory(PersonEloquent::class)->create([
            'date_of_birth' => '1983-12-08',
        ]);
        $person->tags()->attach($tag->getKey(), ['user_id' => $user->getKey()]);
        $leadContext = factory(PersonContextEloquent::class)->create([
            'user_id' => $user->getKey(),
            'person_id' => $person->getKey(),
            'stage_id' => $this->stageId,
            'lead_type_id' => $this->leadTypeId,
        ]);
        $phone = factory(PersonPhoneEloquent::class)->create([
            'person_id' => $person->getKey(),
            'number' => '+6281460000109',
            'is_primary' => 1,
        ]);
        $email = factory(PersonEmailEloquent::class)->create([
            'person_id' => $person->getKey(),
            'is_primary' => 1,
        ]);


        foreach ($actions as $action) {
            //var_dump($workflow->id,$action->id);

            // run action runner
            $kernel = $this->app->make(Kernel::class);
            $status = $kernel->handle(
                $input = new ArrayInput(array(
                    'command'      => 'workflow:action-run',
                    'workflow'     => $workflow->getKey(),
                    'action'       => $action->getKey(),
                )),
                $output = new BufferedOutput
            );
            //echo $output->fetch();
            $this->assertEquals($status, 0);

            // check status
            $this->seeInDatabase('action_logs',[
                'action_id' => $action->getKey(),
                'workflow_id' => $workflow->getKey(),
                'status' => LogInterface::LOG_STATUS_SUCCESS,
                'object_class' => $person->getLoggableType(), 
                'object_id' => $person->getKey(), 
                'user_id' => $user->getKey(),
            ]);
        }

        // check task
        $this->seeInDatabase('tasks',[
            'id' => $hotTaskId,
            'user_id' => $user->getKey(),
        ]);
        
        $this->cleanUpRecords(new PersonObserver, $person);
    }    

    /**
     * test workflow seeder action task-for-cold-lead
     */
    public function testWorkflowSeeder4()
    {
        $user = UserEloquent::find(1);
        $workflow = WorkflowEloquent::where('user_id',$user->id)->where('name','task-for-cold-lead')
            ->whereNull('deleted_at')->get()->first();
        $actions = $workflow->getActions();
        $tag = TagEloquent::whereNull('deleted_at')->where('tag', 'cold')->first();
        $tasks = TaskEloquent::whereNull('deleted_at')->take(2)->get();
        $hotTaskId = $tasks[0]->id;
        $coldTaskId = $tasks[1]->id;

        // send text
        // send mail
        // tag person with hot tag

        // create person test
        $person = factory(PersonEloquent::class)->create([
            'date_of_birth' => '1983-01-18',
        ]);
        $person->tags()->attach($tag->getKey(), ['user_id' => $user->getKey()]);
        $leadContext = factory(PersonContextEloquent::class)->create([
            'user_id' => $user->getKey(),
            'person_id' => $person->getKey(),
            'stage_id' => $this->stageId,
            'lead_type_id' => $this->leadTypeId,
        ]);
        $phone = factory(PersonPhoneEloquent::class)->create([
            'person_id' => $person->getKey(),
            'number' => '+6281460000109',
            'is_primary' => 1,
        ]);
        $email = factory(PersonEmailEloquent::class)->create([
            'person_id' => $person->getKey(),
            'is_primary' => 1,
        ]);


        foreach ($actions as $action) {
            //var_dump($workflow->id,$action->id);

            // run action runner
            $kernel = $this->app->make(Kernel::class);
            $status = $kernel->handle(
                $input = new ArrayInput(array(
                    'command'      => 'workflow:action-run',
                    'workflow'     => $workflow->getKey(),
                    'action'       => $action->getKey(),
                )),
                $output = new BufferedOutput
            );
            //echo $output->fetch();
            $this->assertEquals($status, 0);

            // check status
            $this->seeInDatabase('action_logs',[
                'action_id' => $action->getKey(),
                'workflow_id' => $workflow->getKey(),
                'status' => LogInterface::LOG_STATUS_SUCCESS,
                'object_class' => $person->getLoggableType(), 
                'object_id' => $person->getKey(), 
                'user_id' => $user->getKey(),
            ]);
        }

        // check task
        $this->seeInDatabase('tasks',[
            'id' => $coldTaskId,
            'user_id' => $user->getKey(),
        ]);
        
        $this->cleanUpRecords(new PersonObserver, $person);
    } 
}

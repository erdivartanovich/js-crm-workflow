'use strict'

const program = require('commander')
const di = require('./di')
const workflowService = di.container['WorkflowService']
const actionService = di.container['ActionService']
const ActionExecutor = require('./Services/Action/ActionExecutor')

class Factory {
    constructor() {
        this.attributes = {}
    }

    setWorkflow(workflow) {
        this.attributes.workflow = workflow
    }

    getWorkflow() {
        return this.attributes.workflow
    }

    setObjects(objects) {
        this.attributes.objects = objects
    }

    getObjects() {
        return this.attributes.objects
    }

    setRules(rules) {
        this.attributes.rules = rules
    }

    getRules() {
        return this.attributes.rules
    }
    
    getAction() {
        return this.attributes.action
    }
    
    setAction(action) {
        this.attributes.action = action
    }
}

const factory = new Factory

const run = (workflowId, actionId, isRunnableOnce) => {
    // Get workflow from the inputted workflowId
    workflowService.read(workflowId)
    .then((workflow) => {
        factory.setWorkflow(workflow)
        // Check whether the workflow has action(actionId)
        return workflowService.hasAction(workflow, actionId)
    }).then(hasAction => {
        // Get action from actionId ...
        if (hasAction) {
            return actionService.read(actionId)
        }

        // ... or throw error if it doesn't connected to the workflow
        throw Error('Action is not related to the workflow')
    }).then(action => {
        // set action from actionId
        factory.setAction(action)

        const workflow = factory.getWorkflow()

        // Return objects and rules from workflow
        return Promise.all([
            workflowService.listObjects(workflow),
            workflowService.listRules(workflow)
        ])
    }).then(results => {
        // insert objects and rules into factory object
        factory.setObjects(results[0])
        factory.setRules(results[1])

        // Instantiate ActionExecutor and ...
        const executor = new ActionExecutor(
            factory.getWorkflow(),
            factory.getAction(),
            factory.getObjects(),
            factory.getRules()
        )

        // ... execute!
        isRunnableOnce ? executor.runnableOnce().execute() : executor.execute()
    }).catch(err => console.error(err))
}

program
    .option('-w, --workflow =<n>', 'Workflow id')
    .option('-a, --action <n>', 'Action id')
    .option('-o, --runnable-once', 'Runnable once')
    .on('--help', () => {
        console.log('  Examples:')
        console.log()
        console.log('    $ index -w workflow_id -a action_id')
        console.log()
    })
    .parse(process.argv)

run(program.workflow, program.action, typeof program.runnableOnce == 'undefined' ? false : program.runnableOnce)

if (!process.argv.slice(2).length) {
    program.help()
}

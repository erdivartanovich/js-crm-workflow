'use strict'

const program = require('commander')
const di = require('./di')
const workflowService = di.container['WorkflowService']
const actionService = di.container['ActionService']

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

const run = (workflowId, actionId) => {
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
    })
}

program
.option('-w, --workflow =<n>', 'Workflow id')
.option('-a, --action <n>', 'Action id')
.option('-o, --once', 'Runnable once')
.on('--help', () => {
    console.log('  Examples:')
    console.log()
    console.log('    $ index -w workflow_id -a action_id')
    console.log()
})
.parse(process.argv)

console.log(program.once)

run(program.workflow, program.action)

if (!process.argv.slice(2).length) {
    program.help()
}

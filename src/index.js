'use strict'

const knex = require('./connection')
const program = require('commander')
const di = require('./di')

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
    
    getActions() {
        return this.attributes.actions
    }

    setAction(actions) {
        this.attributes.actions = actions
    }

}
const factory = new Factory

const workflowService = di.container['WorkflowService']

const run = (workflow_id, action_id) => {

    workflowService.read(workflow_id)
    // get workflow
    .then((workflow) => {
        factory.setWorkflow(workflow)
        return workflowService.listActions(workflow)
    })
    // get actions
    .then(actions => {
        return new Promise((resolve, reject) => {
            const msg = 'action is not listed in workflow'
            if (typeof actions == 'undefined') {
                reject(msg)
            }

            const action = actions.filter(act => {
                return act.id == action_id
            })

            if (action.length > 0) {
                factory.setAction(action[0])
                resolve(workflowService.listObjects(factory.getWorkflow()))
            } else {
                reject(msg)
            }
        })
    })
    // get workflow object results
    .then((objects) => {
        factory.setObjects(objects)
        return workflowService.listRules(factory.getWorkflow())
    })
    // get workflow rule results
    .then((rules) => {
        factory.setRules(rules)
    })
    // Execute!
    .then(() => {
        console.log(factory)
    })
    .catch(err => {
        if (typeof err == 'string') {
            console.log(err)
            process.exit()
        }
    })
    .finally(knex.destroy)
}

program
.option('-w, --workflow =<n>', 'Workflow id')
.option('-a, --action <n>', 'Action id')
.on('--help', () => {
    console.log('  Examples:')
    console.log()
    console.log('    $ index -w workflow_id -a action_id')
    console.log()
})
.parse(process.argv)

run(program.workflow, program.action)

if (!process.argv.slice(2).length) {
    program.help()
}

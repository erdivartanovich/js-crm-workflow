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



}
const factory = new Factory

const run = (workflow_id, action_id) => {
    knex.select()
    .from('workflows')
    .where('workflows.id', workflow_id)
    .first()
    .then((workflow) => {
        factory.setWorkflow(workflow)
        // initialize workflow object
        return knex.from('workflow_objects')
            .whereIn('workflow_objects.workflow_id', [workflow.id])
    })
    // get workflow object results
    .then((objects) => {
        factory.setObjects(objects)
        return knex.from('rules').whereIn('rules.workflow_id', [factory.getWorkflow().id])
    })
    // get workflow rule results
    .then((rules) => {
        factory.setRules(rules)
        

    })
    .finally(knex.destroy)
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

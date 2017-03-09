'use strict'

const knex = require('../../connection')
const ResourceFinder = require('../../Services/Action/ResourceFinder')
const TargetServiceFactory = require('./TargetServiceFactory')
const ActionResourcesJob = require('../../Jobs/Action/ActionResourcesJob')
const EventObserver = require('../../Infrastructures/Observer/EventObserver')

class ActionExecutor {

    constructor(workflow, action, objects, rules) {
        this.service = (new TargetServiceFactory(action)).make()
        this.workflow = workflow
        this.filteredRules = []
        this.objects = objects
        this.action = action
        this.rules = rules
        this.event = new EventObserver

        this.event.on('check', (states) => {
            if (!states['finished']) {
                states.finished = 0
            }

            if (states['finished'] >= states['total']) {
                this.event.emit('exit')
            }
        }).on('finished', (states) => {
            if (!states['finished']) {
                states.finished = 0
            }

            states.finished += 1

            this.event.emit('check')
        }).on('exit', (states) => {
            states['exited'] = true

            knex.destroy()
        })
    }

    execute() {
        this.filterRules()
            .then(rules => {
                return rules.length > 0 ? rules : this.rules
            })
            .then(rules => {
                this.filteredRules = rules

                this.resourceFinder = new ResourceFinder(
                    this.workflow,
                    this.action,
                    this.service,
                    this.objects,
                    rules
                )

                return this.runOnce ? this.resourceFinder.runnableOnce() : this.resourceFinder
            })
            .then(resourceFinder => resourceFinder
                .prepareCriteria()
                .getBatches())
            .then(batches => {
                if (batches.length <= 0) {
                    this.event.emit('exit')
                }
                batches.map(batch => {
                    batch.then(resources => {
                        const jobs = new ActionResourcesJob(
                            this.workflow,
                            this.action,
                            resources,
                            this.filteredRules,
                            this.event
                        )

                        jobs.handle(this.service)
                    })
                })
            })
    }

    /**
     * @todo implements spawn service
     */
    spawnService() {

    }

    runnableOnce() {
        this.runOnce = true
        return this
    }

    filterRules() {
        const self = this

        return knex.select('*').from('rules').join('rule_action', (function() {
            this.on(function() {
                this.on('rule_action.rule_id', '=', 'rules.id')
                this.on('rule_action.action_id', '=', knex.raw(self.action.id))
            })
        })).where('rules.workflow_id', self.workflow.id).then(result => {
            self.rules = result
            return self.rules
        })
    }

    getRules() {
        return this.rules
    }

    getAction() {
        return this.action
    }

}

module.exports = ActionExecutor
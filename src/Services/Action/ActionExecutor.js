'use strict'

const knex = require('../../connection')
const ResourceFinder = require('../../Domains/Action/ResourceFinder')
const di = require('../../di')

class ActionExecutor {

    constructor(workflow, action, objects, rules) {
        this.workflow = workflow
        this.action = action
        this.rules = rules
        this.objects = objects
        this.service = di.container['PersonService']
//add log service
    }

    execute() {
		// before prepareCriteria rules should filter with action rules only
        // get rules for action, if not exists, use workflow rules.


        // this.spawnService().then(service => {
        // 	this.service = service
        // 	return filterRules()
        // })
        this.filterRules()
        .then(rules => {
            return rules.length > 0 ? rules : this.rules
        })
        .then(rules => {
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
                .prepareCriteria(12)
                .getBatches())
		.then(batches => {
            console.log(batches.length)
            batches.map(batch => {
                batch.then(result => {
                })
            })
		})
		.then(batch => {
			// while(batch.length) {
			// 	return new ActionResourcesJob(this.workflow, this.action, batch, rules)
			// 	.then(jobs => {
			// 		return jobs.runnableOnce(runnableOnce)
			// 	})
			// 	.then(jobs => {
			// 		//dispatch(jobs) ???
			// 	})
			// 	.then(() => {
			// 		return resourceFinder.getBatch()
			// 	}).then(new_batch => {
			// 		batch = new_batch
			// 	})
			// }
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
                this.on('rule_action.rule_id', '=', self.action.id)
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

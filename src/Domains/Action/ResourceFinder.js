'use strict'

const di = require('../../di')

const RuleCriteriaFactory = require('../../Infrastructures/Rule/RuleCriteriaFactory')
const ObjectCriteriaFactory = require('../../Infrastructures/Workflow/ObjectCriteriaFactory')

class ResourceFinder {

    constructor(workflow, action, service, objects, rules) {
        this.workflow = workflow
        this.userId = workflow.user_id
        this.action = action
        this.rules = rules
        this.objects = objects
        this.personService = service

        this.runOnce = false
    }

    get() {
        return this.personService.browse()
    }

    /**
     * @todo Finish this method
     */
    setUserContext(user) {
        return this
    }

    runnableOnce(runnableOnce) {
        if (typeof runnableOnce == 'undefined') {
            runnableOnce = true
        }

        this.runOnce = runnableOnce

        return this
    }

    prepareCriteria(limit) {
        const ruleCriteria = new RuleCriteriaFactory(this.rules)
        const objectCriteria = new ObjectCriteriaFactory(this.objects)

        this.limit = typeof limit !== 'undefined' ? limit : 100
        this.offset = 0

        /** @todo add filter for userContext Here */

        this.personService
            .resetConditions()
            .applyCriteria(ruleCriteria)
            .applyCriteria(objectCriteria)

        if (this.runnableOnce) {
            /** @todo Only query non exists on action_logs table resource if runnableOnce is true */
        }

        return this
    }

    getBatches() {
        const table = this.personService.tableName
        let count = 0

        return this.personService.get().then(result => {
            count = result.length

            const batches = []

            if (count > 0) {
                do {
                    batches.push(this.personService.paginate(this.limit, this.offset, table + '.*'))
                    this.offset += this.limit
                } while (this.offset < count)
            }

            return batches
        })
    }
}

module.exports = ResourceFinder

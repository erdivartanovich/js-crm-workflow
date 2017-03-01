'use strict'

const di = require('../../di')

const RuleCriteriaFactory = require('../../Infrastructures/Rule/RuleCriteriaFactory')
const ObjectCriteriaFactory = require('../../Infrastructures/Workflow/ObjectCriteriaFactory')

class ResourceFinder {

    constructor(workflow, action, service, objects, rules) {
        this.workflow = workflow
        this.userId = workflow.user_id
        this.action = action
        this.service = service
        this.rules = rules
        this.objects = objects
        this.personService = di.container['PersonService']

        this.runnableOnce = false
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

        this.runnableOnce = runnableOnce

        return this
    }

    prepareCriteria() {
        const ruleCriteria = new RuleCriteriaFactory(this.rules)
        const objectCriteria = new ObjectCriteriaFactory(this.objects)

        this.limit = 100
        this.offset = 0

        /** @todo add filter for userContext Here */

        let builder = this.personService
            .resetConditions()
            .pushCriteria(ruleCriteria)
            .pushCriteria(objectCriteria)

        if (this.runnableOnce) {
            /** @todo Only query non exists on action_logs table resource if runnableOnce is true */
        }
        
        return builder
    }
}

module.exports = ResourceFinder

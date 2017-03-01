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
}

module.exports = ResourceFinder

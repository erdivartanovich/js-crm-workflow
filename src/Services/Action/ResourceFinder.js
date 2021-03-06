'use strict'

const RuleCriteriaFactory = require('../../Infrastructures/Rule/RuleCriteriaFactory')
const ObjectCriteriaFactory = require('../../Infrastructures/Workflow/ObjectCriteriaFactory')
const PersonWorkflowLogCriteria = require('../../Infrastructures/Person/PersonWorkflowLogCriteria')
const di = require('../../di')
const knex = require('../../connection')

class ResourceFinder {

    constructor(workflow, action, service, objects, rules) {
        this.workflow = workflow
        this.userId = workflow.user_id
        this.action = action
        this.rules = rules
        this.objects = objects
        this.personService = di.container['PersonService']

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

        return Promise.resolve((() => {
            if (this.runOnce) {
                const logCriteria = new PersonWorkflowLogCriteria(this.workflow, this.action)

                return this.personService.applyCriteria(logCriteria)
            } else {
                return Promise.resolve(false)
            }
        })()).then(() => {
            //apply getPauseWorkflowByPerson filter
            return this.getPauseWorkflowByPerson()
        }).then((results) => {

            //safety undefined check
            results = (!!results) ? results : []

            results.map((result) => {
                this.personService.where('id', '=', result)
            })

            //return this class as thenable value
            return Promise.resolve(this)
        }).then(result => {

            return Promise.resolve(result)
        })
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


    /**
     * getPauseWorkflowByPerson
     * will return array of object, with value of preferenceable_id
     * example:  [9, 15]
     */

    getPauseWorkflowByPerson() {

        //define data model
        const model = knex('preferences')

        //define preference identifer
        const identifier = 'person-workflow-is-paused'

        return model.where({
                identifier: identifier,
                value: 1,
                preferenceable_type: 'persons'
            })
            .select('preferenceable_id')
            .then((result) => {
                let preferences = []
                result.map((item) => {
                    preferences.push(item.preferenceable_id)
                })
                return Promise.resolve(preferences)
            })

    }
}

module.exports = ResourceFinder
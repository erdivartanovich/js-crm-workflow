'use strict'

const knex = require('../../connection')

class PersonWorkflowLogCriteria {

    constructor(workflow, action) {
        this.workflow = workflow
        this.action = action
    }

    apply(model) {
        return this.getExistLog()
            .then(results => {
                const ids = results.map(id => id.object_id)
                return model.whereNotIn('id', ids)
            })
    }

    getExistLog() {
        return knex('action_logs')
            .where({
                workflow_id: this.workflow.id,
                action_id: this.action.id,
                status: 1
            })
    }
}

module.exports = PersonWorkflowLogCriteria
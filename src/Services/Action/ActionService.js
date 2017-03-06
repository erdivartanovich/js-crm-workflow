'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class ActionService extends BaseService {

    constructor() {
        super()
        this.tableName = 'actions'
    }

    syncWorkFlows(action, workflows) {
		//FIXME
        const ids = workflows.map((workflow) => {
            return workflow.workflow_id
        })

        return knex.transaction(trx => {
            return trx.from('action_workflow').where('action_id', action.id).delete().then(() => {
                return trx.insert(ids.map(item => {
                    item.action_id = action.id
                    return item
                })).into(this.tableName)
            })
        })
    }

    syncRules(action, rules) {
		//TODO
    }

    getExecutor() {
        return this.executor
    }

    getActionWorkflow(workflow, action) {
		//FIXME
        return knex('actions')
			.join('action_workflow', 'action.id', 'workflow_id')
			.select('id')
    }
}

module.exports = ActionService

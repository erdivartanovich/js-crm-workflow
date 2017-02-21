const BaseService = require('../BaseService')
const knex = require('../../connection')

class ActionService extends BaseService {

	constructor() {
		super()
		this.tableName = 'actions'
	}

	syncWorkFlows(action, workflows) {
		//
	}

	syncRules(action, rules) {

	}

	fireAction() {

	}

	getExecutor() {
		
	}

	getActionWorkflow(workflow, action) {

	}
}

module.exports = ActionService
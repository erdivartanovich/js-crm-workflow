const BaseService = require('../BaseService')

class ActionTriggerService extends BaseService {

	constructor() {
		super()
		this.tableName = 'action_triggers'
	}
}

module.exports = ActionTriggerService
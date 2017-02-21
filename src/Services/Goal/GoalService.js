const BaseService = require('../BaseService')

class GoalService extends BaseService {

	constructor() {
		super()
		this.tableName = 'goals'
	}
}

module.exports = GoalService
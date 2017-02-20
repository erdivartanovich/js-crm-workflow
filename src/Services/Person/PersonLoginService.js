const BaseService = require('../BaseService')
const knex = require('../../connection')

class PersonLoginService extends BaseService{

	constructor() {
		super()
		this.tableName = 'person_logins'
	}
}

module.exports = PersonLoginService
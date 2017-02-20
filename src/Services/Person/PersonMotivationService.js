const BaseService = require('../BaseService')
const knex = require('../../connection')

class PersonMotivationService extends BaseService{

	constructor() {
		super()
		this.tableName = 'person_motivations'
	}

	sync(person, motivations) {
		return knex(this.tablename)
			.where('person_motivations.person_id', person.id)
			.delete()
			.then(() => {
				// loop motivations table
				// foreach (motivations as motivation) {
				// 	knex(this.tablename)
				// 	.insert(motivation)	
				// }
				motivations.map(function(motivation) {
					knex(this.tablename)
					.insert(motivation)
				})
			})
	}

}

module.exports = PersonMotivationService
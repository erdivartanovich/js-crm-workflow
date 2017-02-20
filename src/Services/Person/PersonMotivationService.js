const knex = require('../../connection')

class PersonMotivationService {

	constructor() {
		this.tablename = 'person_motivations'
	}

	browse() {
		return knex
			.select()
			.from(this.tablename)
			.get()
	}

	read(id) {
		return knex(this.tablename)
			.where('id', id)
			.first()
	}

	edit(motivation) {
		return knex(this.tablename)
			.where('id', motivation.id)
			.update(motivation)
	}

	add(motivation) {
		return knex(this.tablename)
			.insert(motivation)

	}

	delete(id) {
		return knex(this.tablename)
			.where('id', id)
			.delete()
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
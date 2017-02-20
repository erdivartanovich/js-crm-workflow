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

}

module.exports = PersonMotivationService
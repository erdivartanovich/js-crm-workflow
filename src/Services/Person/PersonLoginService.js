const knex = require('../../connection')

class PersonLoginService {

	constructor() {
		this.tablename = 'person_logins'
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

	edit(login) {
		return knex(this.tablename)
			.where('id', login.id)
			.update(login)
	}

	add(login) {
		return knex(this.tablename)
			.insert(login)

	}

	delete(id) {
		return knex(this.tablename)
			.where('id', id)
			.delete()
	}

}

module.exports = PersonLoginService
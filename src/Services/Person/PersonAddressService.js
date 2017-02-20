const knex = require('../../connection')

class PersonAddressService{

    constructor() {
        this.tableName = 'person_addresses'
        this.identifier = 'id'
    }

    browse() {
        return knex(this.tableName)
    }

    read(id) {
        return knex
            .select()
            .from(this.tableName)
            .where(this.identifier, id)
            .first()
    }

    edit(person) {
        return knex(this.tableName).
               where(this.identifier, person.id).update(person)
    }

    add(person) {
      return knex(this.tableName).insert(person)
    }

    delete(id) {
      return knex(this.tableName).where(this.identifier,id).del()
    }
}

module.exports = PersonAddressService

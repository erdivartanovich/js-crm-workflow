const knex = require('../../connection')

class PersonAddressService{

    constructor() {
        this.tableName = 'person_addresses'
    }

    browse() {
        return knex
            .select()
            .from(this.tableName)
            .get()
    }

    read(id) {
        return knex
            .select()
            .from(this.tableName)
            .where('id', id)
            .first()
    }

    edit(person) {
        return knex
            .from(this.tableName)
            .where('person_id', person.person_id)
            .update(person)
    }


    add() {

    }

    delete() {

    }
}

module.exports = PersonAddressService

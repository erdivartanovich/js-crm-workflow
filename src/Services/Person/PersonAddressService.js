const knex = require('../../connection')

class PersonAddressService{

    constructor() {
        this.tableName = 'person_addresses'
        this.id = 'id'
    }

    browse() {
        return knex(this.tableName)
    }

    read(id) {
        return knex
            .select()
            .from(this.tableName)
            .where(this.id, id)
            .first()
    }

    edit(personAddress) {
        return knex(this.tableName)
               .where(this.id, personAddress.id)
               .update(person)
    }

    add(personAddress) {
      return knex(this.tableName).insert(personAddress)
    }

    delete(id) {
      return knex(this.tableName).where(this.id, id).del()
    }
}

module.exports = PersonAddressService

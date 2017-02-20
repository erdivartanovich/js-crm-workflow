const knex = require('../../connection')

class PersonPhoneService {
  constructor() {
    this.tableName = 'person_phones'
    this.id = 'id'
  }

  browse() {
    return knex(this.tableName)
  }

  read(id) {
    return knex.
        select().
        from(this.tableName).
        where(this.id, id).
        first()
  }

  edit(personPhone) {
    return knex(this.tableName).
          where(this.id,personphone.id).
          update(personPhone)
  }

  add(personPhone) {
    return knex(this.tableName).insert(personPhone)
  }

  delete(personphone) {
    return knex(this.tableName).
          where(this.id, personphone.id).
          update(personphone.deleted_at)
  }
}

module.exports = new PersonPhoneService

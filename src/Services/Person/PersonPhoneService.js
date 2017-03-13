'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonPhoneService extends BaseService {
    constructor() {
        super()
        this.tableName = 'person_phones'
    }

    getPrimary(field, value) {
        return knex(this.tableName)
            .where({
                deleted_at: null,
                is_primary: 1,
                person_id: value
            }).first()
    }

    getNumbers(field_name, value) {
      //select all numbers of a specific user
        return knex(this.tableName)
          .where('deleted_at', null)
          .where(field_name, value)
    }
}

module.exports = PersonPhoneService

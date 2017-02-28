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
                field: value
            }).first()
  }
}

module.exports = PersonPhoneService

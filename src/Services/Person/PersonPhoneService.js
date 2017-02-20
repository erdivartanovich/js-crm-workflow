const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonPhoneService extends BaseService {
  constructor() {
    super()
    this.tableName = 'person_phones'
  }
}

module.exports = new PersonPhoneService

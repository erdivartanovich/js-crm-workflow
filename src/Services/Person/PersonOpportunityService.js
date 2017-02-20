const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonOpportunity extends BaseService {
  constructor() {
    super()
    this.tableName = person_opportunities
  }
}

module.exports = PersonOpportunity;

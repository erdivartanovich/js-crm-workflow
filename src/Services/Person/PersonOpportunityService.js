'use strict'
const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonOpportunityService extends BaseService {
  constructor() {
    super()
    this.tableName = 'person_opportunities'
  }
}

module.exports = PersonOpportunityService;

'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class LeadTypeService extends BaseService{

  constructor() {
    super()
    this.tableName = 'lead_types'
  }


}

module.exports = LeadTypeService

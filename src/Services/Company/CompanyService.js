'use strict'

// declare any required class
const knex = require('../../connection')
const BaseService = require('../BaseService')

// declare class
class CompanyService extends BaseService {

  // declare constructor
  constructor() {
    super()
    this.tableName = 'opportunities'
  }

  // declare the function


}

// export module
module.exports = CompanyService;

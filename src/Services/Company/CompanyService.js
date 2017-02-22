'use strict'

// declare any required class
const knex = require('../../connection')
const BaseService = require('../BaseService')

// declare class
class CompanyService extends BaseService {

  // declare constructor
  constructor() {
    super()
    this.tableName = 'companies'
  }

  // declare the function

  /**
   * compare each attribute except for key and return its equality
   */
  isEqual(company, other) {
    return company.name === other.name && company.address === other.address
  }

  /**
   * inverse of isEqual()
   */
  isNotEqual(company, other) {
    return !isEqual(company, other)
  }

}

// export module
module.exports = CompanyService;

const knex = require('../../connection')
const BaseService = require('../BaseService')

class LeadTypeService extends BaseService{

  constructor() {
     super()
    this.tableName = 'lead_types'
  }

<<<<<<< HEAD
=======
  browse() {
    return knex(this.tableName)
  }

  read(id) {
    return knex(this.tableName)
      .where('id', id)
      .first()
  }

  edit(leadType) {
    return knex(this.tableName)
      .where('id', leadType.id)
      .update(leadType)
  }

  add(leadType) {
    return knex(this.tableName)
      .insert(leadType)
  }

  delete(id) {
    return knex(this.tableName)
    .where('id', id)
    .del()
  }
>>>>>>> develop
}


module.exports = LeadTypeService

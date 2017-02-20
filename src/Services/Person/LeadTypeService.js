const knex = require('../../connection')

class LeadTypeService {

  constructor() {
    this.tableName = 'lead_types'
  }

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
}


module.exports = LeadTypeService

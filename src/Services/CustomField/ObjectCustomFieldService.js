'use strict'
s
const knex = require('../../connection')
const BaseService = require('../BaseService')

class ObjectCustomFieldService extends BaseService{
    /**
     * constructor
     */
    constructor() {
        super()
        // set table name
        this.tableName = 'object_custom_fields'
    }

    getFieldValue(user) {

      return knex(this.tableName)
      let attributes = {
        user_id: user['user_id'],
        custom_field_id: user['custom_field_id'],
        object_id: user['object_id'],
        object_type: user['object_type']
      }

      let objectField = knex(this.tableName).where(attributes).first()

      if (objectField) {
        return objectField
      }

      return knex(this.tableName)
            .insert(attributes, user)

  }

    }
}

module.exports = ObjectCustomFieldService

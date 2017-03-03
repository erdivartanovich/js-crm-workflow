'use strict'

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

    getFieldValue(customField, object, user) {

      let attribute = {
        user_id : user.id,
        object_id : object.id,
        custom_field_id : customField.id,
        object_type : object.tableName,
      }
      
      return knex(this.tableName)
            .where('user_id', attribute.user_id)
            .andWhere('custom_field_id', attribute.custom_field_id)
            .andWhere('object_id', attribute.object_id)
            .andWhere('object_type', attribute.object_type).first()
            .then(result => {
                      
              if (!result) {
                attribute['custom_field_value'] = ''
                return this.add(attribute)
              }

              return result
            })

    }
}

module.exports = ObjectCustomFieldService

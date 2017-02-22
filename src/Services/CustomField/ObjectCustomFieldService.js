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

}

module.exports = ObjectCustomFieldService

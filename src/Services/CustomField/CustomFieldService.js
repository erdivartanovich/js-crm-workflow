'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class CustomFieldService extends BaseService{
    /**
     * constructor
     */
    constructor() {
        super()
        // set table name
        this.tableName = 'custom_fields'
    }

}

module.exports = CustomFieldService

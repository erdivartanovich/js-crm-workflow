'use strict'

const BaseService = require('../BaseService')

class CustomFieldAvailabilityService extends BaseService{

    /**
     * constructor
     */
    constructor(){
        super()
        //set the table name
        this.tableName = 'custom_field_availability'
    }

}

module.exports = CustomFieldAvailabilityService

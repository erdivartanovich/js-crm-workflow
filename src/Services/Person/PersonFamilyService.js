const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonFamilyService extends BaseService {
    
    /**
     * Constructor
     */
    constructor() {
        //set the table name
        this.tableName = 'person_family'
    }

    
}

module.exports = PersonFamilyService
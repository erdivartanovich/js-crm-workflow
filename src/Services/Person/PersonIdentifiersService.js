const knex = require('../../connection')
const BaseService = require('../BaseService')


class PersonIdentifierService {
    /**
     * Constructor
     */
    constructor() {
        //set the table name
        this.tableName = 'person_identifiers'
    }
}

module.exports = PersonIdentifierService
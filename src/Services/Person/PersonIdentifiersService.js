const knex = require('../../connection')
const BaseService = require('../BaseService')


class PersonIdentifierService extends BaseService {
    /**
     * Constructor
     */
    constructor() {
        super()
        //set the table name
        this.tableName = 'person_identifiers'
    }
}

module.exports = PersonIdentifierService
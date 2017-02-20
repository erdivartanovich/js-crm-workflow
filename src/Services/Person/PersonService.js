const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonService extends BaseService {
    /**
     * Constructor
     */
    constructor() {
        super()
        this.tableName = 'persons'
    }
}

module.exports = PersonService
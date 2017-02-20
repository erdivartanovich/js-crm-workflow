const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonScoresService {
    /**
     * constructor
     */
    constructor() {
        // set table name
        this.tableName = 'person_scores'
    }
    
}

module.exports = PersonScoresService
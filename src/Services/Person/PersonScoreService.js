'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonScoresService extends BaseService{
    /**
     * constructor
     */
    constructor() {
        super()
        // set table name
        this.tableName = 'person_scores'
    }
    
}

module.exports = PersonScoresService

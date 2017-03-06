'use strict'

const BaseService = require('../BaseService')

class PersonProfessionService extends BaseService {

    constructor() {
        super()
        this.tableName = 'person_professions'
    }
}

module.exports = PersonProfessionService

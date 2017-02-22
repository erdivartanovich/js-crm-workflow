'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class NoteService extends BaseService {
    constructor() {
        super()
        this.tableName = 'notes'
    }
}

module.exports = NoteService

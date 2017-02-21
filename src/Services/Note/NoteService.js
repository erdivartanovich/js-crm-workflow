'use strict'

const BaseService = require('../BaseService')

class NoteService extends BaseService {
    constuctor() {
        super()
        this.tableName = 'notes'
    }
}

module.exports = NoteService

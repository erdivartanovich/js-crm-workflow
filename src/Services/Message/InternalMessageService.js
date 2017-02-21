'use strict'

const BaseService = require('../BaseService')

class InternalMessageService extends BaseService {
    
    constructor() {
        super()
        this.tableName = 'internal_messages'
    }
}

module.exports = InternalMessageService

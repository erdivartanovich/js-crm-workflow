'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class InternalMessageService extends BaseService {
    
    constructor() {
        this.tableName = 'internal_messages'
    }
}

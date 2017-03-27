'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class CommunicationTemplateService extends BaseService {
    constructor() {
        super()
        this.tableName = 'communication_templates'
    }
}

module.exports = CommunicationTemplateService

'use strict'

const BaseService = require('../BaseService')

class WorkflowService extends BaseService {
    constructor() {
        super()
        this.tableName = 'workflows'
    }

    // TODO: implements addRule(workflow, rule)
}

module.exports = WorkflowService

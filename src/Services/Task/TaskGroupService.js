'use strict'

const BaseService = require('../BaseService')

class TaskGroupService extends BaseService {
    constructor() {
        super()
        this.tableName = 'task_groups'
    }
}

module.exports = TaskGroupService

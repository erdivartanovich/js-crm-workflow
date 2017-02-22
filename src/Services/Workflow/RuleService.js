'use strict'

const BaseService = require('../BaseService')

class RuleService extends BaseService {
    constructor() {
        super()
        this.tableName = 'rules'
    }

    // TODO: implements syncActions, getParentsFor, getDependentRules, getRuleThatHasAction
}

module.exports = RuleService

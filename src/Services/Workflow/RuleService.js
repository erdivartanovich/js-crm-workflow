const BaseService = require('../BaseService')

class RuleService extends BaseService {
  constructor() {
    super()
    this.tableName = 'rules'

  }
}

module.exports = RuleService

'use strict'

const BaseService = require('../BaseService')


class PersonEmailService extends BaseService {
    constructor() {
      super()
        this.tableName = 'person_emails'

    }
}

module.exports = PersonEmailService

const BaseService = require('../BaseService')

class PersonContactTypeService extends BaseService {

    constructor() {
        super()
        this.tableName = 'person_contact_types'
        this.id = 'id'
    }
}

module.exports = PersonContactTypeService

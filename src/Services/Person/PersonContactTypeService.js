const BaseService = require('../BaseService')

class PersonContactTypeService extends BaseService {

    constructor() {
        super()
        this.tableName = 'person_contact_types'
    }

    sync(person, ...contactType) {
        
    }
}

module.exports = PersonContactTypeService

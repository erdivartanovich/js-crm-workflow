const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonAddressService extends BaseService{

    constructor() {
        super()
        this.tableName = 'person_addresses'
    }

}

module.exports = PersonAddressService

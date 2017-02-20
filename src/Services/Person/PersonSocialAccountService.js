const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonSocialAccountService extends BaseService{

    constructor(){
        super()
        this.tableName = 'person_social_accounts'
    }

}

module.exports = PersonSocialAccountService

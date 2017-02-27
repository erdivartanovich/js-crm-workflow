'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class SocialNetworkService extends BaseService{

    constructor(){
        super()
        this.tableName = 'social_networks'
    }
    
    listsDefaults(user){
        return knex(this.tableName)
                   .whereNull('user_id')
                   .orWhere('user_id', user['user_id'])
    }

}

module.exports = SocialNetworkService
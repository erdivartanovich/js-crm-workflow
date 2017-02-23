'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class StageService extends BaseService{

    constructor(){
        super()
        this.tableName = 'stages'
    }

    listsDefaults(user_id){
        return knex(this.tableName)
                   .whereNull('user_id')
                   .orWhere('user_id', user_id)
    }
    
}

module.exports = StageService

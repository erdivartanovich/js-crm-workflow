'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class SocialNetworkService extends BaseService{

    constructor(){
        super()
        this.tableName = 'social_networks'
        this.model = knex(this.tableName)
    }
    
    applyConditions(attributes){
        for(var value in attributes){
            if(Array.isArray(attributes[value])){
                let field, condition, val
                [field, condition, val] = attributes[value]
    
                return this.model.where(field, condition, val).first().then(result => {
                    this.model = result
                })
            
            }else{
                
                return this.model.where(value, attributes[value]).first().then(result => { 
                    this.model = result 
                })
            
            }
            
        }

    }

    firstOrCrete(attributes){
        return this.applyConditions(attributes).then(result => {
            let model = this.model
            this.resetModel()
            return model === undefined ? this.add(attributes) : model
        })
    }

    resetModel(){
        this.model = knex(this.tableName)
    }

    listsDefaults(user){
        return knex(this.tableName)
                   .whereNull('user_id')
                   .orWhere('user_id', user['user_id'])
    }

}

module.exports = SocialNetworkService
'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class SocialNetworkService extends BaseService{

    constructor(){
        super()
        this.tableName = 'social_networks'
        this.model = knex(this.tableName)
    }

    /**
     * Retrieve first data from  or create it.
     * 
     * @param object atrributes 
     * @return object
     */
    firstOrCrete(attributes){
        for(var value in attributes){
            this.model = this.model.where(value, attributes[value])
        }
        
        let model = this.model.first()
        this.resetModel()

        return model.then(result => {
            if(result){
                return result
            }else{
                return this.add(attributes).then(id => {
                    return this.read(id)
                })
            }

        })
    }

    /**
     * set model value to tableName
     * this method used by firstOrCreate method
     */
    resetModel(){
        this.model = knex(this.tableName)
    }

    /**
     * Lists user's resource and default resources (without user_id)
     * @param object user
     * @return object
     */
    listsDefaults(user){
        return knex(this.tableName)
                   .whereNull('user_id')
                   .orWhere('user_id', user['user_id'])
    }

}

module.exports = SocialNetworkService
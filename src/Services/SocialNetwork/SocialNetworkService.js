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
    firstOrCreate(attributes){
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

    getInstances(labels, user) {

        const promises = labels.map(label => this.getByLabel(label.trim(), user))

        return Promise.all(promises)
        .then(results => {
            return results
        })
    }

    getByLabel(label, user) {
        return this.readBy('label', label).where('user_id', 'is', null).then(result => {
            if (typeof result != 'undefined') {
                return Promise.resolve(result)
            }

            if (typeof user != 'undefined') {
                return this.firstOrCreate({ 'label': label, 'user_id': user.id })
            }

            return Promise.resolve(null)
        }).then(result => {
            return result
        })
    }
}

module.exports = SocialNetworkService

'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonSocialAccountService extends BaseService{

    constructor(){
        super()
        this.tableName = 'person_social_accounts'
        this.socialNetworkServiceTable = knex('social_networks')
    }

    /**
     * checking social_network_id first before adding data
     * throw an exception if social_network_id doesn't exist 
     */
    add(socialAccount){
        return this.socialNetworkServiceTable.where('id', socialAccount.social_network_id).first()
                .then(result => {
                    if(result === undefined){
                        throw 'Person Social Account need valid social network id.'
                    }

                    this.beforeAdd(socialAccount)
                    return knex(this.tableName).insert(socialAccount)
                })
    }


    /**
     * checking social_network_id first before updating data
     * throw an exception if social_network_id doesn't exist 
     */
    edit(socialAccount){
        return this.socialNetworkServiceTable.where('id', socialAccount.social_network_id).first()
                .then(result => {
                    if(result === undefined){
                        throw 'Person Social Account need valid social network id.'
                    }

                    this.beforeEdit(socialAccount)
                    return knex(this.tableName).where('id', socialAccount['id']).update(socialAccount)
                })
    }

}


module.exports = PersonSocialAccountService

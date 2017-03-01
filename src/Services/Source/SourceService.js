'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

//require Lodash
const _ = require('lodash')

class LeadTypeService extends BaseService{

    constructor() {
        super()
        this.tableName = 'lead_types'
    }


}

module.exports = LeadTypeService


/**
* SourceService Class
* It has all useful methods for business logic
*/
class SourceService extends BaseService {

    constructor() {
        super()
        this.tableName = 'sources'
    }
   
  
    deleteUnused() {
        //return delete unused
        const usedSource = () => {
            return knex(this.tableName)
            .join('referrals', 'referrals.source_id', 'sources.id')
            .where('referrals.source_type', 'sources')
            .select('source_id')
        }
        usedSource().then(function(source_id_results) {
            //the source_id_results will be array of object [{source_id: x}, ...]
            //get array of source_ids from source_id_results object

            let source_ids = []
            _.forEach(source_id_results, function(source) {
                source_ids.push(source.source_id)
            })
                        
            //delete from sources where id not in source_ids

            return knex('sources')
                .whereNotIn('id', source_ids)
                .del()
        })
    }

   
    getInstances(labels, user) {
        //labels should be an array
        const instances = []

        _.forEach(labels, (label) => {
            instances.push(this.getByLabel(label.trim(), user))
        })
        return instances
    }

    
    listsDefaults(user) {
        return knex(this.tableName)
            .whereNull('user_id')
            .orWhere('user_id', user.id)
    }

    getByLabel(label, user) {
        const findLabel = () => {
            return knex(this.tableName)
                .where({
                    label: label, user_id: null
                })
                .first()
        }
        findLabel().then((labelObj) => {
            let resource = labelObj
            if (resource) {
                return Promise.resolve(resource) 
            } else {
                return Promise.resolve() //just skipped to next then
            }
        })
        .then(() => {
            const getFirst = () => {
                return knex(this.tableName)
                    .where({label: label, user_id: user.id})
                    .first()
            }
            getFirst().then((sources) => {
                if (typeof sources == 'undefined') {
                    //create new one
                    return knex(this.tableName)
                        .insert({label: label, user_id: user.id})
                } else {
                    //return sources
                    return Promise.resolve(sources)
                }
            })
        })
    }

}

module.exports = SourceService
 


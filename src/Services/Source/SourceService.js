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
        usedSource().then((result) => {
            //the result will be array of object [{source_id: x}, ...]
            //get array of source_ids from result object
            
            let source_ids = result.map((item) => {return item.source_id})
            
            //delete from sources where id not in source_ids

            return knex(this.tableName)
                .whereNotIn('id', source_ids)
                .del()
        })
    }

   
    getInstances(labels, user) {
        //labels should be an array
        const instances = new Collection();

        labels.forEach((label) => {
            //instances.push(this.getByLabel(trim(label), user))
        })

        return instances;
    }

    
    listsDefaults(user) {
        // return this.listsDefaults(user)
    }
}

const source = new SourceService()
source.deleteUnused()

module.exports = SourceService
 


'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

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

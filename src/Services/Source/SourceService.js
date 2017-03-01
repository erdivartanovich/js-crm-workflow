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
        const usedSource = function () {
            knex(this.tableName)
            .join('referrals', 'referrals.source_id', 'sources.id')
            .where('referrals.source_type', 'sources')
            .select('source_id')
        }
        usedSource.then((result) => result)
        

        // $usedSources = $this->persistenceStorage()
        //     ->join('referrals', 'referrals.source_id', '=', 'sources.id')
        //     ->where('referrals.source_type', '=', 'sources')
        //     ->lists('source_id');

        // return $this->persistenceStorage()->whereNotIn('id', $usedSources)->delete();
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



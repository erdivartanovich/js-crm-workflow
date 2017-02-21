const knex = require('../../connection')
const BaseService = require('../BaseService')

class PersonService extends BaseService {
    /**
     * Constructor
     */
    constructor() {
        super()
        this.tableName = 'persons'
    }

    add(person) {
        /**
         * ***** WAIT FOR THIS SERVICES AVAILABLE *****
         * Inject User Service here
         *  -- Find or insert related user of person
         */

        /**
         * Inject Stage Service
         * -- Find or insert related stage of the person
         */

        /**
         * Inject LeadType service
         * -- Find or insert related LeadType of the person 
         */

        //Set user_id, stage_id and lead_type_id
        //add person
        super.add(person)
    }

    update(person) {
        /**
         * ***** WAIT FOR THIS SERVICES AVAILABLE *****
         * Inject User Service here
         *  -- Find or insert related user of person
         */

        /**
         * Inject Stage Service
         * -- Find or insert related stage of the person
         */

        /**
         * Inject LeadType service
         * -- Find or insert related LeadType of the person 
         */

        //Set user_id, stage_id and lead_type_id
        //add person
        super.apdate(person)
    }
}

module.exports = PersonService
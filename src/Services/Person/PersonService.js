//knex query builder
const knex = require('../../connection')

//require BaseService
const BaseService = require('../BaseService')

//require UserService dependency
const UserService = require('../User/UserService')

//require StageService dependency
const StageService = require('../Stage/StageService')

//require LeadTypeService dependency
const LeadTypeService = require('../Person/LeadTypeService')

class PersonService extends BaseService {
    /**
     * Constructor
     */
    constructor() {
        super()
        this.tableName = 'persons'

        //Inject User Service here
        this.user = new UserService

        //inject StageService here
        this.stage = new StageService

        //inject LeadTypeService here
        this.lead_type = new LeadTypeService
    }

    getUser(user_id) {
        return this.user.read(user_id)
    }

    ensureUser(user) {
        return new Promise((resolve, reject) => {
            if (typeof user !== 'undefined') {
                resolve(user.id)
            } else {
                reject('user not found')
            }
        })
    }

    findOrAddStage(stage) {
        return new Promise((resolve, reject) => {
            if (typeof stage === 'undefined' || typeof stage.id === 'undefined') {
                reject(stage)
            } else {
                this.stage.read(stage.id)
                .then((result) => {
                    if (typeof result != 'undefined') {
                        resolve(result.id)
                    } else {
                        reject(stage)
                    }
                })
            }
        })
        .catch ((stage) => {
            this.stage.add(stage).returning('id')
            .then((result) => result)
        })
    }
    
    findOrAddLeadType(lead_type) {
        return new Promise((resolve, reject) => {
            if (typeof lead_type === 'undefined' || typeof lead_type.id === 'undefined') {
                reject(lead_type)
            } else {
                this.lead_type.read(lead_type.id)
                .then((result) => {
                    if (typeof result != 'undefined') {
                        resolve(result.id)
                    } else {
                        reject(lead_type)
                    }
                })
            }
        })
        .catch ((lead_type) => {
            this.lead_type.add(lead_type).returning('id')
            .then((result) => result)
        })
    }
    
    add(person) {
       
        /**
         * then Find user enitity of the person
         */ 
        //get user 
        this.getUser(person.user_id) 
            // got the user but maybe undefined
            .then ((user) => 
                //ensure user is valid
                this.ensureUser(user)) 
            
        // Find or insert related stage of the person
        .then(() => this.findOrAddStage(person.stage))

        // Find or insert related LeadType of the person 
        .then(() => this.findOrAddLeadType)

        //add person
        //super.add(person)
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
//knex query builder
const knex = require('../../connection')

//require BaseService
const BaseService = require('../BaseService')

//require UserService dependency
const UserService = require('../User/UserService')

class PersonService extends BaseService {
    /**
     * Constructor
     */
    constructor() {
        super()
        this.tableName = 'persons'
        this.user = new UserService
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
    
    add(person) {
        /**
         * Inject User Service here
         *  -- Find user enitity of the person
         */

        //get user 
        this.getUser(person.user_id) 
            // got the user but maybe undefined
            .then ((user) => 
                //ensure user is valid
                this.ensureUser(user)) 
            
        /**
         * Inject Stage Service
         * -- Find or insert related stage of the person
         */
        

        /**
         * Inject LeadType service
         * -- Find or insert related LeadType of the person 
         */

        .then((user_id) => console.log('user id is: ', user_id))
            .catch((message) => console.log('error ! : ', message))
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
'use strict'

//TODO
//instead use lot of require, use dependency method

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

//require PersonProfessionService
const PersonProfessionService = require('../Person/PersonProfessionService')

var _ = require('lodash')

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

        //personProfession service
        this.profession = new PersonProfessionService

        this.referralSourcesMap = {
            'persons': this,
            'users': this.userService,
            'sources': this.sourceService
        }

        
        this.relationLists = {
            person_addresses: {'persons.id': 'person_addresses.person_id'},
            person_contact_types: {'persons.id': 'person_contact_types.person_id'},
            person_emails: {'persons.id': 'person_emails.person_id'},
            person_family: {'persons.id': 'person_family.person_id'},
            person_identifiers: {'persons.id': 'person_identifiers.person_id'},
            person_motivations: {'persons.id': 'person_motivations.person_id'},
            person_phones: {'persons.id': 'person_phones.person_id'},
            person_preferences: {'persons.id': 'person_preferences.person_id'},
            person_professions: {'persons.id': 'person_professions.person_id'},
            person_scores: {'persons.id': 'person_scores.person_id'},
            person_social_accounts: {'persons.id': 'person_social_accounts.person_id'},
        }

    }

    ensureUser(user_id) {
        return new Promise((resolve, reject) => {
            this.user.read(user_id).then ((user) => {
                if (typeof user !== 'undefined') {
                    resolve({'user_id' : user.id})
                } else {
                    reject('user not found')
                }
            })
        })
    }

    findOrAddStage(stage) {
        return new Promise((resolve) => {
            if (typeof stage === 'undefined' || typeof stage.id === 'undefined') {
                this.stage.add(stage).returning('id').then(stage_id => resolve({'stage_id': Number(stage_id.join())}))
            } else {
                this.stage.read(stage.id)
                .then((result) => {
                    if (typeof result != 'undefined') {
                        resolve({'stage_id': Number(result.id.join())})
                    } else {
                        this.stage.add(stage).returning('id').then(stage_id => resolve({'stage_id': Number(stage_id.join())}))
                    }
                })
            }
        })
    }
    
    findOrAddLeadType(lead_type) {
        return new Promise((resolve) => {
            if (typeof lead_type === 'undefined' || typeof lead_type.id === 'undefined') {
                this.lead_type.add(lead_type).returning('id').then((lead_type_id) => resolve({'lead_type_id': Number(lead_type_id.join())}))
            } else {
                this.lead_type.read(lead_type.id)
                .then((result) => {
                    if (typeof result != 'undefined') {
                        resolve({'lead_type_id': Number(result.id.join())})
                    } else {
                        this.lead_type.add(lead_type).returning('id').then((lead_type_id) => resolve({'lead_type_id': Number(lead_type_id.join()) }))                        
                    }
                })
            }
        })
    }
    
    add(person) {
       
        /**
         * 
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
        return new Promise ((resolve, reject) => {
            Promise.all (
                [
                    this.ensureUser(person.user_id),
                    this.findOrAddStage(person.stage),
                    this.findOrAddLeadType(person.lead_type)
                ]
            )
            .then((result) => {
                person['user_id'] = result[0].user_id
                person['stage_id'] = result[1].user_id
                person['lead_type_id'] = result[2].lead_type_id
                
                delete person.lead_type
                delete person.stage

                //add person
                resolve(super.add(person))
            })
            .catch((errorWhy) => reject(errorWhy))
        })
    }

    update(person) {
        /**
         * 
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
        return new Promise ((resolve, reject) => {
            Promise.all (
                [
                    this.ensureUser(person.user_id),
                    this.findOrAddStage(person.stage),
                    this.findOrAddLeadType(person.lead_type)
                ]
            )
            .then((result) => {
                person['user_id'] = result[0].user_id
                person['stage_id'] = result[1].user_id
                person['lead_type_id'] = result[2].lead_type_id
                
                delete person.lead_type
                delete person.stage

                //add person
                resolve(super.update(person))
            })
            .catch((errorWhy) => reject(errorWhy))
        })
    }

    
    syncReferrals(person, compositeSourcesIds) {
        
        let promises = []

        _.map(compositeSourcesIds, (carry, compositeId) => {
            const {table, id} = compositeId.split('-')

            if (typeof id !== 'undefined') {
                promises.push(this.referralSourcesMap[table].read(id))                
            }
        })

        return Promise.all(promises).then(results => {
            return _.reduce(results, (carry, result) => {
                if (result) {
                    return carry.push(result)
                }

                return carry
            }, [])
        })
        //TODO need to write referralService to execute below, referralService not exist yet
        // .then((sources) => this.referralService.sync(person, sources))
    }

    //TODO attachProfilePhoto
    attachProfilePhoto(person, digitalAsset) {
    }

    //TODO updateInitialContactDate
    updateInitialContactDate(person, date = null) {
    }

    getRelationLists() {
        return this.relationLists
    }

    resetIsPrimary(person) {
        return knex(this.tableName).where({
            id: person['id'],
            is_primary:  1
        }).update({
            is_primary: 0
        })
    }

    setupCompanyAndProfession(person, result) {
        //get person company
        this.profession.readBy('person_id', person.id)
            .then((company_id) => {
                this.findOrAddRelated()
            })        
    }

}

module.exports = PersonService
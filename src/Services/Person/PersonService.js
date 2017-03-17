'use strict'

//TODO
//instead use lot of require, use dependency method

//knex query builder
const knex = require('../../connection')

//require BaseService
const BaseService = require('../BaseService')

//require Lodash
const _ = require('lodash')

class PersonService extends BaseService {
    /**
     * Constructor
     */
    constructor(user, stage, lead_type, profession, company) {
        super()

        //dependency injection
        this.user_service = user
        this.stage_service = stage
        this.lead_type_service = lead_type
        this.profession_service = profession
        this.company_service = company

        this.tableName = 'persons'

        this.referralSourcesMap = {
            'persons': this,
            'users': this.user_service,
            'sources': this.sourceService //TODO: user service not exist yet
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

        this.modelAssets = knex('digital_assets')

    }

    ensureUser(user_id) {
        return new Promise((resolve, reject) => {
            this.user_service.read(user_id).then ((user) => {
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
                this.stage_service.add(stage).returning('id').then(stage_id => resolve({'stage_id': Number(stage_id.join())}))
            } else {
                this.stage_service.read(stage.id)
                .then((result) => {
                    if (typeof result != 'undefined') {
                        resolve({'stage_id': Number(result.id.join())})
                    } else {
                        this.stage_service.add(stage).returning('id').then(stage_id => resolve({'stage_id': Number(stage_id.join())}))
                    }
                })
            }
        })
    }

    findOrAddLeadType(lead_type) {
        return new Promise((resolve) => {
            if (typeof lead_type === 'undefined' || typeof lead_type.id === 'undefined') {
                this.lead_type_service.add(lead_type).returning('id').then((lead_type_id) => resolve({'lead_type_id': Number(lead_type_id.join())}))
            } else {
                this.lead_type_service.read(lead_type.id)
                .then((result) => {
                    if (typeof result != 'undefined') {
                        resolve({'lead_type_id': Number(result.id.join())})
                    } else {
                        this.lead_type_service.add(lead_type).returning('id').then((lead_type_id) => resolve({'lead_type_id': Number(lead_type_id.join()) }))
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
            .then((new_person) => {
                this.setupCompanyAndProfession(person, new_person)
            })
            .then(() => {
                this.setupMotivation(person)
            })
            .then(() => {
                this.setupContactTypes(person)
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
            .then((new_person) => {
                this.setupCompanyAndProfession(person, new_person)
            })
            .then(() => {
                this.setupMotivation(person)
            })
            .then(() => {
                this.setupContactTypes(person)
            })
            .catch((errorWhy) => reject(errorWhy))
        })
    }


    syncReferrals(person, compositeSourcesIds) {

        let promises = []

        _.map(compositeSourcesIds, (carry, compositeId) => {
            const comps = compositeId.split('-')

            if (typeof comps.id !== 'undefined') {
                promises.push(this.referralSourcesMap[comps.table].read(comps.id))
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
    updateInitialContactDate(person, date) {
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

    setupCompanyAndProfession(person, person_result) {
        //person = old_value, person_result = new_value
        //for person.add method, those two values will be equals

        if ((typeof person_result['profession'] != 'undefined')) {
            return knex('person_professions')
            .where('person_id', person_result.id)
            .then((person_profession) => {
                if (person_profession.length <= 0) {
                    return this.profession_service.add({
                        person_id: person_result.id,
                        title: person_result.title
                    })
                    .then((person_profession) => Promise.resolve(person_profession))
                } else {
                    return Promise.resolve(person_profession)
                }
            })
            .then((person_profession) => {
                if (person_profession.company_id === null) {
                    //if company_id not exist then add it into company from person_result.company
                    // but check if person_result.company is defined
                    if (typeof person_result['profession']['company'] != 'undefined') {
                        return this.company_service.add({
                            name: person_result.company.name
                        })
                    } else {
                        return Promise.resolve({id: null})
                    }
                } else {
                    //if it exist return the enew one from person_result
                    if (person_result['profession']['company'] != 'undefined') {
                        return this.company_service.readBy('name', person_result['profession']['company']['name'])
                    } else {
                        return Promise.resolve({id: null})
                    }
                }
            })
            .then((company) => {
                return knex('person_professions')
                .where('person_id', person_result.id)
                .update({
                    company_id: company.id,
                    title: person_result.profession.title
                })
            })
        } else {
            //profession not defined
            console.log(person_result, ' -> profession/company not defined')
        }
    }

    setupMotivation(person) {
        var motivations = []

        /**
         * for each person.motivations
         * - search for default first
         * - if motivation == null
         * - - create for current user
         *
         * @param person = {
         *      id: x,
         *      name: xxx,
         *      motivations: [
         *          {label: 'somthing'},
         *          ...
         *      ]
         *      user: {id: x}
         * }
         *
         */

        _.forEach(person.motivations, (item) => {
            motivations.push(item.label)
        })
        //ensure motivations
        const fn = function promise(label) {
            let sql = 'delete from motivations where label = ? and user_id = ?'
            return knex.raw(sql, [label, person.user.id])
        }
        let promises = motivations.map(fn)
        const createOrReplace = Promise.all(promises)
        createOrReplace.then(function() {
            const fn = function promise(label) {
                return knex('motivations').returning('id').insert({
                    label: label,
                    user_id: person.user.id
                })
            }
            let promises = motivations.map(fn)
            const replace = Promise.all(promises)
            return replace
        })
        //update relational person_motivations
        .then((motiv_ids) => {
            //delete existing
            const motivations_ids = _.flatten(motiv_ids)
            return knex('person_motivations')
                .where('person_id', person.id)
                .del()
                .then(() => {
                    return Promise.resolve(motivations_ids)
                })
        })
        .then((motivations_ids) => {
            //insert new person_motivations
            const fn = function promise(id) {
                return knex('person_motivations').returning('id').insert({
                    person_id: person.id,
                    motivation_id: id
                })
            }
            let promises = motivations_ids.map(fn)
            const insertNew = Promise.all(promises)
            return insertNew
        })
        .catch(console.log.bind(console))
    }

    setupContactTypes(person) {
        var contact_types = []

        /**
         * for each person.contact_types
         * - search for default first
         * - if contact_types == null
         * - - create for current user
         *
         * @param person = {
         *      id: x,
         *      name: xxx,
         *      contact_types: [
         *          {label: 'somthing'},
         *          ...
         *      ]
         *      user: {id: x}
         * }
         *
         */

        _.forEach(person.contact_types, (item) => {
            contact_types.push(item.label)
        })
        //ensure contact_types
        const fn = function promise(label) {
            let sql = 'delete from contact_types where label = ? and user_id = ?'
            return knex.raw(sql, [label, person.user.id])
        }
        let promises = contact_types.map(fn)
        const createOrReplace = Promise.all(promises)
        createOrReplace.then(function() {
            const fn = function promise(label) {
                return knex('contact_types').returning('id').insert({
                    label: label,
                    user_id: person.user.id
                })
            }
            let promises = contact_types.map(fn)
            const replace = Promise.all(promises)
            return replace
        })
        //update relational person_contact_types
        .then((motiv_ids) => {
            //delete existing
            const contact_types_ids = _.flatten(motiv_ids)
            return knex('person_contact_types')
                .where('person_id', person.id)
                .del()
                .then(() => {
                    return Promise.resolve(contact_types_ids)
                })
        })
        .then((contact_types_ids) => {
            //insert new person_contact_types
            const fn = function promise(id) {
                return knex('person_contact_types').returning('id').insert({
                    person_id: person.id,
                    motivation_id: id
                })
            }
            let promises = contact_types_ids.map(fn)
            const insertNew = Promise.all(promises)
            return insertNew
        })
        .catch(err => err)
    }

    getProfilePhoto(person) {

        return this.modelAssets.whereIn('id', knex.raw('select `asset_id` from `assetables` where `assetables`.`assetable_id` = ' + person.id + ' and `assetables`.`assetable_type` = \'persons\' and `assetables`.`asset_type` = 1'))
            .first()
            .then((asset) => {
                if (typeof asset === 'undefined') {
                    return ''
                }
                
                return asset.public_url
            })
            .catch(err => err)
    }

}

module.exports = PersonService


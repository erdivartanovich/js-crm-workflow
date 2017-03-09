'use strict'

const BaseService = require('../BaseService')
const PersonSocialAccount = require('./PersonSocialAccountService')
const PersonPhoneService = require('./PersonPhoneService')
const PersonEmailService = require('./PersonEmailService')
const PersonService = require('./PersonService')

const Moment = require('moment')

const parse = require('libphonenumber-js')
const asYouType =require('libphonenumber-js')

const knex = require('../connection')
const _ = require('lodash')

class PersonCrawlService extends BaseService {
    constructor() {
        super()
        this.personPhoneService = new PersonPhoneService()
        this.personEmail = new PersonEmailService()
        this.personService = new PersonService()
    }

    /**
     *  Process Person Data
     * @param resp
     * @param person
     * @param result
     * @return Array
     */
    processPersonData(resp, person, user, result) {
        if (resp.status==200) {
            result['fullcontact'] = data
            // process profile image
            return Promise.resolve(this.processProfileImages(result, person))
                .then(() => {
                    // process social profiles
                    return Promise.resolve(this.processProfileSocials(result, person, user))
                })
        }
        return result
    }

}

module.exports = PersonCrawlService

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

    processPhone(data, person) {
        const phone = {}
        return Promise.resolve(() => {
            if (typeof person != 'undefined') {
                const number = data['datafinder']['results'][0]['Phone']
                const phoneNumber = parse(number, 'US')
                const countryCode = asYouType(phoneNumber).country_phone_code

                phone.person_id= person.id
                phone.label= 'Datafinder Phone'
                phone.number= number
                phone.country_code= countryCode
                phone.is_current= false
                phone.is_primary= false
            }
        })
        .then((phone) => {
            return this.personPhoneService.browse().where({ person_id: phone.person_id, number: phone.number})
                    .first()
        })
        .then(res => {
            if (typeof res == 'undefined') {
                this.PersonPhoneService.create(phone)
            }
        })
        .then((data) => data)
    }
}

module.exports = PersonCrawlService

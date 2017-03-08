'use strict'

const BaseService = require('../BaseService')
const PersonSocialAccount = require('./PersonSocialAccountService')
const PersonPhoneService = require('./PersonPhoneService')
const PersonEmailService = require('./PersonEmailService')
const PersonService = require('./PersonService')

const wrapper = require('@refactory-id/kwapi-wrapper-js')
const KWApi = wrapper.KWApi
const Credential = wrapper.Credential
const credential = new Credential('abc123')

const Moment = require('moment')
// const parse = require('libphonenumber-js')
// const asYouType =require('libphonenumber-js')
const knex = require('../../connection')
const _ = require('lodash')

class PersonCrawlService extends BaseService {
    constructor() {
        super()
        // console.log(Credential)
        credential.setEndPoint('http://localhost:8000/v1')
        this.kwapi = new KWApi(credential)
        this.personPhoneService = new PersonPhoneService()
        this.personEmail = new PersonEmailService()
        this.personService = new PersonService()
    }

    crawlEmail(email, person, user) {
        const api = this.kwapi
        const dfind = {}
        const result = {}
        let resPersonData, resPerson, resDemo

        if(person) {
            dfind['d_first'] = person.first_name
            dfind['d_last'] = person.last_name
        }

        return api.People().lookupEmail(email)
        .then(response => {
            console.log(response)
            resPersonData = response
            return api.Demographic().getDemographics(dfind)
        })
        .then(response => {
            resDemo = response.getCause()
            result['datafinder']['message'] = resDemo

            if(resPersonData.message !== 'undefined') {
                result.fullcontact.message += resPersonData.message
            }
            return this.processPersonData(resPerson, person, user, result)
        })
        .then(response => {
            return this.processDemographicData(resDemo, person, response)
        })
        .catch(err => console.log(err))

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

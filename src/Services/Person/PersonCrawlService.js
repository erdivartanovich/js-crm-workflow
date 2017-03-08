'use strict'

const BaseService = require('../BaseService')
const PersonSocialAccount = require('./PersonSocialAccountService')
const PersonPhoneService = require('./PersonPhoneService')
const PersonEmailService = require('./PersonEmailService')
const PersonService = require('./PersonService')

const Moment = require('moment')

const parse = require('libphonenumber-js').parse
const asYouType =require('libphonenumber-js').asYouType

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
     * Set social account object and save todatabase
     * @param person
     * @param array social
     * @param socialNetworkId
     * @return PersonSocialAccountInterface|mixed
     */

    setSocialAccount(person, social, socialNetworkId) {
        
        //set the db model
        const socialAccountModel =  knex('person_social_accounts')

        //  find current social network account on person
        return socialAccountModel.where({
            person_id: person.id,
            social_network_id: socialNetworkId,
        })
        .first()
        .then(socialAccount => {

            //if not found init new empty object
            if (typeof socialAccount == 'undefined') {
                socialAccount = {}
            }

            //set identifier with value of url or username or id
            if (typeof social['url'] != 'undefined') {
                socialAccount['identifier'] = social['url']
            }

            if (typeof social['username'] != 'undefined') {
                socialAccount['identifier'] = social['username']
            }

            if (typeof social['id'] != 'undefined') {
                socialAccount['identifier'] = social['id']
            }

            //set social network id
            socialAccount['social_network_id'] = socialNetworkId

            //set last_crawled_date
            socialAccount['last_crawled_date'] = this.getNow()

            //save social object into data in json string
            socialAccount['data'] = JSON.stringify(social)
            
            //if id not undefined update
            if (typeof socialAccount.id != 'undefined') {
                return socialAccountModel.update(socialAccount)
            }
            
            //if undefined insert new
            socialAccount['person_id'] = person.id
            return socialAccountModel.insert(socialAccount)

        })


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

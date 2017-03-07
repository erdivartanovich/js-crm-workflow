'use strict'

const BaseService = require('../BaseService')
const PersonSocialAccount = require('./PersonSocialAccountService')
const PersonPhoneService = require('./PersonPhoneService')
const PersonEmailService = require('./PersonEmailService')
const PersonService = require('./PersonService')

const Moment = require('moment')
// const { parse, format, asYouType } = require('libphonenumber-js')
const parse = require('libphonenumber-js').parse
const format = require('libphonenumber-js').format
const asYouType = require('libphonenumber-js').asYouType

const knex = require('../connection')
const _ = require('lodash')
/**
 * @todo Write KWAPI Wrapper to NodeJS
 */

class PersonCrawlService extends BaseService {
    constructor(person) {
        super()
        this.personSocialAccounts = new PersonSocialAccounts()
        this.personPhoneService = new PersonPhoneService()
        this.personEmail = new PersonEmailService()
        this.personService = new PersonService()
        this.api = Kwapi()
    }

    crawlEmail(email, person, user) {

        const dfind = {}

        //resPerson = api.people().lookupEmail(email)
        const resPerson = ?

        if (person) {
            dfind.d_first = this.PersonService.read(person.id).first_name
            dfind.d_last = this.PersonService.read(person.id).last_name
        }

        // FIXME create JS version
        //resDemo = api.demographic().getDemographics(dfind)

        const result = {
            fullcontact: {message: resPerson.? },
            datafinder: {message: resDemo.? }
        }

        // resPersonData = resPerson.getBody()
        const resPersonData = ?

        if(resPersonData.message) {
            result.fullcontact.message += resPersonData.message
        }

        result = this.processPersonData(resPerson, person, user, result)
        result = this.processDemographicData(resDemo, person, result)

        return result

        }


    crawlPerson(person, user) {

        const emails = null

        return this.personEmail.browse().where('person_id', person.id).then(emails => {
            const result = []

            emails.map(email =>
                const tmp = this.crawlEmail(email.email, person, user)
                result[email.email] = tmp
            )

            return result
        })
    }

    processPersonData(resp, person, user, result) {
        // FIXME this resp.getBody is from KWAPI
        const data = resp.getBody().then(status => status)
        const getStatusCode = resp.getStatusCode().then(response => response)

        if(getStatusCode == 200 && data['status']== 200) {
            result['fullcontact'] = data
            // process profile image
            result = this.processProfileImages(result, person)
            // process social profiles
            result = this.processProfileSocials(result, person, user)
        }

        return result
    }

    processDemographicData(resp, person, result) {
        const = resp.getBody()
        result['datafinder'] = data['finder']

        // process data
        if (resp.getStatusCode() == 200 && data['datafinder']['num-results'] > 0) {
            // birthday
            result = this.processBirthday(result, person)
            // relationship Status
            // phone
            result - this.processPhone(result, person)
        }

        return result
    }

    processBirthday(data, person) {
        try {
            //dob = Carbon::createFromFormat('Ymd',data['datafinder']['results'][0]['DOB']).format('Y-m-d')
            const dob = Moment('Ymd', data['datafinder']['results'][0]['DOB']).format('YYYY-MM-DD')
        }
        catch (e) {
            const dob = null
        }

        if (person && !person.getDateOfBirth() && dob) {
            person.setDateOfBirth(dob)
            this.personService.update()
            data['datafinder']['saved'][] = 'day of birth'
        }

        return data
    }



    processPhone(data, person) {

        if (person) {
            const number = data['datafinder']['results'][0]['Phone']

            try {
                const phoneNumber = parse(number, 'US')
                const countryCode = asYouType(phoneNumber).country_phone_code
            } catch (e) {
                countryCode = 'US'
            }

            const phone = {}
                phone['person_id'] = person.id
                phone['label'] = 'Datafinder Phone'
                phone['number'] = number
                phone['country_code'] = countryCode
                phone['is_current'] = false
                phone['is_current'] = false
        }

        this.PersonPhoneService.browse().where({ person_id: phone.person_id, number: phone.number})
            .first()
            .then(res => {
                if (typeof res == 'undefined') {
                    this.PersonPhoneService.create(phone)
                }

            })

        return data
    }

    processProfileImages(data, person) {

        const asset = {}
        // TODO create getProfilePhoto()

        // check current profile image
        if (person && !this.getProfilePhoto() && data['fullcontact']['photos'] !== 'undefined') {
            const found = false
            const i = 0

            while(!found && i < data['fullcontact']['photos'].length) {
                const photo = data['fullcontact']['data'][i]
                // TODO create getImageUrlMimeType()
                const mime_type = this.ImageUrlMimeType(photo['url'])

                asset['path'] = photo['url']
                asset['mime_type'] = mime_type
                asset['storage_type'] = 'url'
                asset['public_url'] = photo['url']

                // FIXME create digitalServiceInterface
                asset = this.digitalServiceInterface.create(asset)

                // FIXME create attachProfilePhoto in PersonService
                person = this.personService.attachProfilePhoto( person, asset)
                if (asset && person) {
                    data['fullcontact']['photos'][i]['saved'] = true
                    found = true
                }
                i++
            }

        }

        return data
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

    processProfileSocials(data, person, user) {
        if (person) {

            //FIXME find new Collection method of JS
            const group = data['fullcontact']['photos'] ? _.groupBy(data['fullcontact']['photos'], 'typeId') : {}

         data['fullcontact']['socialProfiles'].map(item => {
             const social = item
             typeId = item['typeId']

             // check social network id
             // FIXME getInstances()

         })


        }
    }

    crawlPersonById(personId) {
        person = this.personService.read(personId)
        return this.crawlPerson(person)
    }

}

module.exports = PersonCrawlService

'use strict'

const BaseService = require('../BaseService')
const PersonSocialAccount = require('./PersonSocialAccountService')
const PersonPhoneService = require('./PersonPhoneService')
const PersonEmailService = require('./PersonEmailService')
const PersonService = require('./PersonService')
/**
 * @todo Write KWAPI Wrapper to NodeJS
 */

class PersonCrawlService extends BaseService {
    constructor(person) {
        super()
        this.personSocialAccounts = new PersonSocialAccounts()
        this.PersonPhoneService = new PersonPhoneService()
        this.personEmail = new PersonEmailService()
        this.personService = new PersonService()
        // FIXME KWAPI
    }

    crawlEmail(email, person, user) {

        const dfind = {}

        //$resPerson = $api->people()->lookupEmail($email);
        const resPerson = ?

        if (person) {
            dfind.d_first = this.PersonService.read(person.id).first_name
            dfind.d_last = this.PersonService.read(person.id).last_name
        }

        // FIXME create JS version
        //$resDemo = $api->demographic()->getDemographics($dfind);

        const result = {
            fullcontact: {message: resPerson.? },
            datafinder: {message: resDemo.? }
        }

        // $resPersonData = $resPerson->getBody();
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


}



}

module.exports = PersonCrawlService

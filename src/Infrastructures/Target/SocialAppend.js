'use strict'

const person = require('../../connection')

class SocialAppend {

    /**
     * @var PersonCrawlServiceInterface
     */

    constructor(crawlService) {
        this.crawlService = crawlService
    }

    crawlEmail(person){
        let res = this.crawlService.crawlPerson(person)

        return 
    //     let api = 'kwapi wrapper'
    //     let resPerson = api.people.lookupEmail(email)

    //     let dFind = []
        
    //     if(person){
    //         dFind['d_first'] = person.firstName
    //         dFind['d_last'] = person.lastName
    //     } 

    //     let resDemo = api.demographic.getDemographics(dFind)

    //     let result = {
    //         'fullcontact' : {'message' : resPerson.getCause()},
    //         'datafinder' : {'message' : resDemo.getCause()} //what is getCause ?
    //     }

    //     let resPersonData = resPerson

    //     if(resPersonData === undefined){
    //         result = {'fullcontact' : {'message' : resPersonData.message}}
    //     }

    //     result =    
    // }

    // crawlPerson(person, user) {
    //     let emails = knex('person_email').where('person_id',person.id)
        
    //     let resultArr = []
        
    //     for(let emailarr in emails){
    //         let tmp = this.crawlEmail(emailarr.email, person, user)
    //         resultArr[emailarr.email] = tmp
    //     }

    //     return resultArr


        // return Promise.resolve(
        //     this.crawlService.crawlPerson({
        //         person : person.id})
        // ).then((res) => {
        //     if(res){
        //         return res
        //     }
        // })
    }

}

module.exports = SocialAppend
'use strict'

const BaseService = require('../BaseService')
const PersonSocialAccount = require('./PersonSocialAccountService')
const PersonPhoneService = require('./PersonPhoneService')
const PersonEmailService = require('./PersonEmailService')
const PersonService = require('./PersonService')

const Moment = require('moment')
const { parse, format, asYouType } = require('libphonenumber-js')
const knex = require('../connection')
const _ = require('lodash')

const https = require('https')
const http = require('http')
const fileType = require('file-type')
const Promise = require('bluebird')

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

    processProfileImages(data, person) {
        
        const tableName = 'digital_assets'
        
        if(person && !person.getProfilePhoto() && data.fullcontact.photos === undefined){
            let found = false
            
            Promise.resolve(   
                //promise with blubird
                Promise.each(data.fullcontact.photos, function(photo) {
                
                    if(!found){

                        //promise for getting Mime Type
                        this.getUrlMimeType(photo.url).then((mimeType) => {
                            let payload = {
                                path: photo.url,
                                mime_type: mimeType,
                                storage_type: 'url',
                                public_url: photo.url
                            }

                            //promise knex insert
                            this.beforeAdd()
                            let add = knex(tableName).insert(payload)
                            add.then(id => {
                                let read = knex(this.tableName)
                                            .where('deleted_at', null)
                                            .where('id', id)
                                            .first()
                            
                                //promise knex read
                                read.then(data => {
                                    person = this.personService.attachProfilePhoto(person, data)
                
                                    if(data && person){
                                        photo.saved = true
                                        found = true
                                    }

                                })
                            })
                        })
                    }
                })
                
                ).then(() => data)
        }

        return data
    }
    
    getUrlMimeType(url){
        let protocol = url[4] === 's' ? https : http 

        return new Promise((resolve) => {
            protocol.get(url, res => {
                res.once('data', chunk => {
                    res.destroy()
                    resolve(fileType(chunk).mime)
                })   
            })
        })
    }

}

module.exports = PersonCrawlService
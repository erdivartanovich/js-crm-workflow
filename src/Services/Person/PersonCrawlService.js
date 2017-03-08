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

const https = require('https');
const http = require('http');
const fileType = require('file-type');

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
        let asset = {}
        const tableName = 'digital_assets'
        
        //promise
        return new Promise((resolve) => {

            if(person && !person.getProfilePhoto() && data.fullcontact.photos === undefined){
                let found = false
                let i = 0
                
                    //promise
                let promiseData = Promise.resolve(data.fullcontact.photos)
                promiseData.then(photos => {

                    if(!found && i < data.fullcontact.photos.length){
                        
                            //promise
                            this.getUrlMimeType(photos[i].url)
                            .then(result => {
                                
                                let payload = {
                                    path: photos[i].url,
                                    mime_type: result,
                                    storage_type: 'url',
                                    public_url: photos[i].url
                                }

                                //promise
                                this.beforeAdd()
                                let add = knex(tableName).insert(payload)
                                add.then(id => {
                                    let read = knex(this.tableName)
                                                .where('deleted_at', null)
                                                .where('id', id)
                                                .first()
                            
                                    read.then(data => {
                                        person = this.personService.attachProfilePhoto(person, asset)
                    
                                        if(asset && person){
                                            data.fullcontact.photos[i].saved = true
                                            found = true
                                        }
                                        
                                        i++

                                    })
                                })
                                //end of promise
                            })
                            //end of promise
                        
                    }else{
                        return
                    }    
                   
                })
                    //end of promise
            }

            resolve(data)

        })
        //end of promise
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
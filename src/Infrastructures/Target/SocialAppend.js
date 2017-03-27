'use strict'

const person = require('../../connection')

class SocialAppend {

    /**
     * @var PersonCrawlServiceInterface
     */

    constructor(crawlService) {
        this.crawlService = crawlService
    }

    crawlPerson(person){
        let res = this.crawlService.crawlPerson(person)
        return res !== undefined
    }

}

module.exports = SocialAppend
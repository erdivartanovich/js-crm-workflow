'use strict'
const knex = require('../../connection')
const BaseService = require('../BaseService')

class TagService extends BaseService {

    constructor() {
        super()
        this.tableName = 'tags'
    }

    attach(object, user, tags) {
        return this.attach(object, user, tags)
    }

    detach(object, user, tags) {
        return this.detach(object, user, tags)
    }

    getTag(tag) {
        return this.findWhere({'tag': tag})
    }

    getInstances(tagsData) {
        let tags = new Set()     

        for (let tag of tagsData) {
            if (typeof tag['id'] != 'undefined') {
                tags.set(this.find(tag['id']))
            } else if (typeof tag['tag'] != 'undefined') {
                tags.set(this.firstOrCreate({'tag': tag['tag'].trim().toLowerCase()}))
            }
        }

        return tags
    }
}

module.exports = TagService

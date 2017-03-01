'use strict'
const knex = require('../../connection')
const BaseService = require('../BaseService')

class TagService extends BaseService {

    constructor() {
        super()
        this.tableName = 'tags'
    }

    attach(object, user, tags) {
        let ids = []
        for (let tag of tags) {
            ids[tag.id] = {'user_id': user.id}
        }
        object.tags().attach(ids)

        this.triggerUpdatedEvent(object)
        
        for(let tag of tags) {
            (new TagObserver).updated(tag)
        }
        return true
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

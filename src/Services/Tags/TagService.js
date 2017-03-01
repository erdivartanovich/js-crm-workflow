'use strict'
const knex = require('../../connection')
const BaseService = require('../BaseService')

class TagService extends BaseService {

    constructor() {
        super()
        this.tableName = 'tags'
    }

    /**
     * attach method
     * attach tags to entity with morphMany relation
     * expect:
     *  - entity => could be person, user, or task etc
     *  - user 
     *  - tags 
     *  - type => entity type/name e.g 'person', 'user', 'task'
     */
    attach(entity, user, tags, type) {

        const payloads = []

        _.map(tags, tag => {
            payloads.push({
                user_id: user.id,
                tag_id: tag.id,
                taggable_id: entity.id,
                taggable_type: type
            })
        })

        return knex('taggables').insert(payloads)
    }

    /**
     * detach method
     * detach tags to entity with morphMany relation
     * expect:
     *  - entity => could be person, user, or task etc
     *  - user 
     *  - tags 
     *  - type => entity type/name e.g 'person', 'user', 'task'
     */
    detach(entity, user, tags, type) {
        const tag_ids = []
        const payloads = {
            user_id: user.id,
            taggable_id: entity.id,
            taggable_type: type
        }
        _.map(tags, tag => {
            tag_ids.push(tag.id)
        })

        return knex('taggables').whereIn('tag_id', tag_ids).where(payloads).del()
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

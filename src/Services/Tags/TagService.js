'use strict'
const knex = require('../../connection')
const BaseService = require('../BaseService')
const _ = require('lodash')

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
            payloads.push({user_id: user, tag_id: tag.id, taggable_id: entity.id, taggable_type: type})
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
            user_id: user,
            taggable_id: entity.id,
            taggable_type: type
        }
        _.map(tags, tag => {
            tag_ids.push(tag.id)
        })

        console.log('xxxx: ', payloads)
        console.log('yyyy: ', tag_ids)

        return knex('taggables')
            .whereIn('tag_id', tag_ids)
            .where(payloads)
            .del()
    }

    /**
     * Function transform request to collection of tags. Creates tag on the fly if id is not provided
     */
    getInstances(tagsData) {
        let tagIds = []
        let tags = []
        let promises1 = []
        let promises2 = []

        //Build the promise from iteration of tagsData
        _.map(tagsData, tag => {
            if (typeof tag['id'] != 'undefined') {
                //select
                promises1.push(knex(this.tableName).where('id', tag['id']))
                //store the tag_ids
                tagIds.push(tag['id'])
            } else if (typeof tag['tag'] != 'undefined') {
                //firstOrCreate
                const sql = 'INSERT INTO ' + this.tableName + ' (tag) SELECT * FROM (SELECT ?) AS tmp  WHERE NOT EXISTS (    SELECT tag FROM ' + this.tableName + ' WHERE tag = ? ) LIMIT 1'
                promises2.push(knex.raw(sql, [tag['tag'], tag['tag']]))
                //store the tag for later select
                tags.push(tag['tag'])
            }
        })

        return Promise.all(promises1)
            .then(() => {
                return Promise.all(promises2)
            })
            .then(() => {
                //select id from tags where tag in [tags] => array of stored tags
                console.log(tags)
                return knex(this.tableName)
                    .whereIn('tag', tags)
                    .select('id')
            })
            .then(objIds => {
                _.map(objIds, id => {
                    tagIds.push(id.id)
                })
                console.log(tagIds)
                //select all based on tagIds return array of tags object
                return knex(this.tableName).whereIn('id', tagIds)
            })

    }

}

module.exports = TagService

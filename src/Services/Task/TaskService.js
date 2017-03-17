'use strict'
/**
* declare any require
*/
const knex = require('../../connection')
const BaseService = require('../BaseService')
const tagService = require('../Tags/TagService')
const Promise = require('bluebird')

class TaskService extends BaseService {
  /**
  * declare constructor for Task Service class
  */
    constructor() {
        super()
        this.tableName = 'tasks'
        this.model = knex(this.tableName)
        this.tagService = new tagService
    }

  /**
  * additional function: active
  */
    activate(payload) {
        return knex(this.tableName)
          .where('id', payload['id'])
          .update({
              status: 1,
              updated_by: payload['updated_by'],
              updated_at: this.getNow()
          })
    }

  /**null
  * additional function: deactivate
  * to
  */
    deactivate(payload) {
        return knex(this.tableName)
          .where('id', payload['id'])
          .update({
              status: 0,
              updated_by: payload['updated_by'],
              updated_at: this.getNow()
          })
    }

  /**
  * additional function: attachTags
  */
    attachTags(task, user, tags) {
        const arrTag = []
        const tagModel = knex('tags')
        const taggablesModel = knex('taggables')
        
        
        // safety check of undefined tags
        tags = !!tags ? tags : []

        //flatten array of tag objects 
        tags.map((tag) => {
            arrTag.push(tag.tag)
        })

        //define function to get instance of tags from db that should contains tag.id
        const getTagsRecords = function() {
            return tagModel.whereIn('tag', arrTag)
        }

        //define function to populate set of ids that will be attached into taggables id 
        const populateIds =function(_tags) {
            let ids = []
            _tags.map((_tag) => {
                let new_id = {}
                new_id['tag_id'] = _tag.id
                new_id['user_id'] = user.id 
                new_id['taggable_type'] = 'tasks'
                new_id['taggable_id'] = task.id
                ids.push(new_id)
            })
            return Promise.resolve(ids)
        }

        //define function to attach new set of ids
        const attachIds = function(ids) {
            let payloads = ids
            return Promise.each(payloads, (payload) => {
                return taggablesModel.insert(payload)
            })
        }
       
       //chain all earlier function into single process
        return getTagsRecords()
          .then(populateIds)
          .then(attachIds)
          .then(() => {return Promise.resolve(true)})
          .catch((error) => {return Promise.resolve(false)})

    }

  /**
  * additional function: detachTags
  */
    detachTags() {
      // fix me
    }

  /**
  * additional function: syncTags
  */
    syncTags() {
      // fix me
    }

  /**
  * additional function: markCompleted
  */
    markCompleted(payload) {
      // fix me
    }

  /**
  * additional function: markNotCompleted
  */
    markNotCompleted(payload) {
        return knex(this.tableName)
          .where('id', payload['id'])
          .update({
              is_completed: 0,
              updated_by: payload['updated_by'],
              updated_at: this.getNow()
          })
    }

  /**
  * additional function: assignTo
  */
    assignTo() {
      // fix me
    }

  /**
  * additional function: restore
  */
    restore() {
      // fix me
    }

  /**
  * additional function: clone
  */
    clone(task) {
        let data = {
            //build payload object, with property value is null if not defined
            task_type: task.task_type
              ? task.task_type
              : null,
            task_action: task.task_action
              ? task.task_action
              : null,
            due_date: task.due_date
              ? task.due_date
              : null,
            from_interaction: task.from_interaction
              ? task.from_interaction
              : null,
            reason: task.reason
              ? task.reason
              : null,
            description: task.description
              ? task.description
              : null,
            is_completed: task.is_completed
              ? task.is_completed
              : null,
            is_automated: task.is_automated
              ? task.is_automated
              : null,
            status: task.status
              ? task.status
              : null
        }

        return this
          .model
          .where(data)
    }

  /**
  * additional function: isTaskStarredBy
  */
    isTaskStarredBy() {
      // fix me
    }

  /**
  * additional function: starTaskBy
  */
    starTaskBy() {
      // fix me
    }

  /**
  * additional function: unstarTaskBy
  */
    unstarTaskBy() {
      // fix me
    }
}
/**
* export module
*/
module.exports = TaskService

'use strict'
/**
* declare any require
*/
const knex = require('../../connection')
const BaseService = require('../BaseService')

class TaskService extends BaseService {
  /**
  * declare constructor for Task Service class
  */
  constructor() {
    super()
    this.tableName = 'tasks'
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

  /**
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
  attachTags() {
    // fix me
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
  clone() {
    // fix me
    return Promise.resolve(true)
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

'use strict'
/**
* declare any require
*/
const knex = require('../../connection')
const BaseService = require('../BaseService');

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
  activate() {
    // fix me
  }

  /**
  * additional function: deactivate
  */
  deactivate() {
    // fix me
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
  markCompleted() {
    // fix me
  }

  /**
  * additional function: markNotCompleted
  */
  markNotCompleted() {
    // fix me
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
module.exports = TaskService;

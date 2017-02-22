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

  }

  /**
  * additional function: attachTags
  */
  attachTags() {

  }

  /**
  * additional function: detachTags
  */
  detachTags() {

  }

  /**
  * additional function: syncTags
  */
  syncTags() {

  }

  /**
  * additional function: markCompleted
  */
  markCompleted() {

  }

  /**
  * additional function: markNotCompleted
  */
  markNotCompleted() {

  }

  /**
  * additional function: assignTo
  */
  assignTo() {

  }

  /**
  * additional function: restore
  */
  restore() {

  }

  /**
  * additional function: clone
  */
  clone() {

  }

  /**
  * additional function: isTaskStarredBy
  */
  isTaskStarredBy() {

  }

  /**
  * additional function: starTaskBy
  */
  starTaskBy() {

  }

  /**
  * additional function: unstarTaskBy
  */
  unstarTaskBy() {

  }
}
/**
* export module
*/
module.exports = TaskService;

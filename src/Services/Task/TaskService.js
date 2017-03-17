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
    this.model = knex(this.tableName)
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
   * This method intended to change deleted_at value to be null, 
   * so data that already set to 
   * soft delete will able to appear.
   * 
   * @param task object 
   * @return pormise of query builder
   */
  restore(task) {
    if(!task.permanent_deleted_at){
      task.deleted_at = null

      //called from BaseService
      return this.edit(task)
    }

    return Promise.resolve(null)
    
  }

  /**
  * additional function: clone
  */
  clone(task) {
      let data = {
          //build payload object, with property value is null if not defined
          task_type: task.task_type ? task.task_type : null,
          task_action: task.task_action ? task.task_action : null,
          due_date: task.due_date ? task.due_date : null,
          from_interaction: task.from_interaction ? task.from_interaction : null,
          reason: task.reason ? task.reason : null,
          description: task.description ? task.description : null,
          is_completed: task.is_completed ? task.is_completed : null,
          is_automated: task.is_automated ? task.is_automated : null,
          status: task.status ? task.status : null,
      }

      return this.model.where(data);
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

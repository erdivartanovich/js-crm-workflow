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
  * @param tags = [{id: 1, tag: 'cold'}, {id: 2, tag: 'important'}]
  */
    detachTags(tasks, users, tags) {
        const arrTag = []
        tags.map((tag) => arrTag.push(tag.tag_id))

       return knex('taggables')
          .whereIn('tag_id', arrTag)
          .where({
              task_id: tasks.id,
              user_id: users.id
          })
          .del()
          .then((result) => {
              return result
          })
          .catch(err => err)
            
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

const tag = new TaskService()

return tag.detachTags({id: 10, tag: 'cold'}, {tasks_id: 2}, [{tag_id: 10, tag:'starred'}])
  .then((result) => console.log(result))
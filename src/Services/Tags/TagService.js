/**
* declare any required file
*/
'use strict'
const knex = require('../../connection')
const BaseService = require('../BaseService')

class TagService extends BaseService {
  /**
  * TagService constructor
  */
  constructor() {
    super()
    this.tableName = 'tags'
  }
  /**
  * additional function for attach tags with object
  */
  attach() {
    // fix me:
  }

  /**
   * additional function for deattach
   */
   detach() {
     // fix me:
   }

   /**
    * additional function for sync
    */
    sync() {
      // fix me:
    }

    /**
     * additional function trigger update event for object
     */
     triggerUpdatedEvent() {
      //  fix me:

     }

     /**
      * additional function apply search adapter
      * set criteria
      */
      applySearchAdapter() {
        // fix me:
      }
}
/**
* export module
*/
module.exports = TagService

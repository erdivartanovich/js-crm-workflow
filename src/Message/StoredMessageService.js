const knex = require('../../connection')
const BaseService = require('../BaseService')

class StoredMessageService extends BaseService {
    
    /**
     * Constructor
     */
    constructor() {
        super()
        //set the table name
        this.tableName = 'stored_messages'
    
    }

}

module.exports = StoredMessageService
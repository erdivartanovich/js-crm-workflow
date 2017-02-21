const BaseService = require('../BaseService')

class LogService extends BaseService{

    constructor(){
        super()
        this.tableName = 'action_logs'
    }

}

module.exports = LogService

const BaseService = require('../BaseService')

class InteractionService extends BaseService{

    constructor(){
        super()
        this.tableName = 'interactions'
    }

}

module.exports = InteractionService

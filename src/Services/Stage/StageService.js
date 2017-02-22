'use strict'

const BaseService = require('../BaseService')

class StageService extends BaseService{

    constructor(){
        super()
        this.tableName = 'stages'
    }

}

module.exports = StageService

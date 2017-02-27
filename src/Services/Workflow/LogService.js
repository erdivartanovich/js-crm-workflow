'use strict'

const BaseService = require('../BaseService')

class LogService extends BaseService{

    constructor(){
        super()
        this.tableName = 'action_logs'
    }

    doLog(workflow, action, rules, status, info, loggableType, loggableId) {

    	if(typeof loggableType === 'undefined') {
    		loggableType = null
    	}

    	if(typeof loggableId === 'undefined') {
    		loggableId = null
    	}

    	const logObject = {
    		workflow_id: workflow.id,
    		action_id: action.id,
    		user_id: workflow.user_id,
    		status: status,
    		info: info,
    		object_class: loggableType,
    		object_id: loggableId 
    	}

    	let log = {}

    	this.add(logObject).returning(['id', 'workflow_id', 'action_id', 'user_id', 'status', 'info', 'object_class', 'object_id'])
    	.then(result => {
    		log = result;
    		this.attachRules(log)
    	})
    	,then(result => {
    		return log
    	})
    }

}

module.exports = LogService

'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class LogService extends BaseService{

    constructor(){
        super()
        this.tableName = 'action_logs'
    }

    attachRules(log, rules) {

    	let attach = {}
    	let ids = []

    	rules.map((rule) => {
    		attach.action_log_id = log.id,
    		attach.rule_id =  rule.id

    		ids.push(attach)
    		attach = {}
    	})
    	
    	return knex.insert(ids.map(item => {
    		return item
    	})).into('action_log_rules')
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

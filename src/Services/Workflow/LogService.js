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

    	let logObject = {
    		workflow_id: workflow.id,
    		action_id: action.id,
    		user_id: workflow.user_id,
    		status: status,
    		info: info,
    		object_class: loggableType,
    		object_id: loggableId 
    	}

    	let log = {}

    	return this.add(logObject)
    	.then(() => {
    		return knex(this.tableName).orderBy('id', 'desc').first()
    	})
    	.then(result => {
    		log = result
    		return new Promise((resolve, reject)=>{
    			this.attachRules(log, rules).then((result)=>{
    				resolve({log, result})
    			})
    		})
    		return this.attachRules(log, rules)
    	})
    	.then(test => {
			// console.log(test.log.id)
			return test.log
		})
    }



}

module.exports = LogService

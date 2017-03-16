'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class LogService extends BaseService {

    constructor(workflowService) {
        super()
        this.tableName = 'action_logs'
        this.workflowService = workflowService
    }

    attachRules(log, rules) {

        let attach = {}
        let ids = []

        rules.map((rule) => {
            attach.action_log_id = log.id,
                attach.rule_id = rule.id

            ids.push(attach)
            attach = {}
        })

        return knex.insert(ids.map(item => {
            return item
        })).into('action_log_rules')
    }

    doLog(workflow, action, rules, status, info, loggableType, loggableId) {

        if (typeof loggableType === 'undefined') {
            loggableType = null
        }

        if (typeof loggableId === 'undefined') {
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
                return new Promise((resolve, reject) => {
                    this.attachRules(log, rules).then((result) => {
                        resolve({ log, result })
                    })
                })
                return this.attachRules(log, rules)
            })
            .then(test => {
                // console.log(test.log.id)
                return test.log
            })
    }

    // FIXME: need to implement this method
    isRunned(workflow, action, resource) {
        const result = 0

        return Promise.resolve(result > 0)
    }

    isParentRunned(workflow, action, resource, rules) {
        console.log('Parent rule(s)', rules)
        return this.workflowService.getRulesActions(workflow, rules)
            .then((parentActions) => {
                console.log('Parent actions', parentActions)
                const queries = []

                parentActions.map((parentAction) => {
                    const conditions = {
                        'workflow_id': workflow.id,
                        'action_id': parentAction.id,

                        // @todo: need to get resource table based on supplemented resource.
                        // ... for now, it's assumed that every resource is person.
                        'object_class': 'persons',
                        'object_id': resource.id,
                        'status': 1,
                    }

                    const query = this.resetConditions().browse().where(conditions).count()
                    queries.push(query)
                })

                return Promise.all(queries)
            }).then(results => {
                // console.log('Log checking result...', results)
                const counts = []

                results.map(result => {
                        result.map(count => {
                            counts.push(count['count(*)'])
                        })
                    })
                    // console.log(counts)
                return counts.reduce((carry, count) => {
                    return carry && (count > 0)
                }, true)
            })
    }



}

module.exports = LogService
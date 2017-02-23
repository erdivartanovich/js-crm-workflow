'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class WorkflowService extends BaseService {

    constructor(rule, object, action, task) {
        super()
        this.tableName = 'workflows'
        this.objectTableName = 'workflow_objects'

        this.pivots = {
            action: 'action_workflow'
        }

        this.services = {
            rule, action, task
        }
    }

    addRule(workflow, rule) {
        rule.workflow_id = workflow.id

        return this.services.rule.add(rule)
    }

    deleteRule(rule, forced)
    {
        return this.services.rule.delete(rule, forced)
    }

    editRule(object) {
        return this.services.object.edit(object)
    }

    addObject(workflow, object) {
        object.workflow_id = workflow.id

        return knex(this.objectTableName).insert(object)
    }

    updateObject(object)
    {
        return knex(this.objectTableName).update(object).where('id', object.id)
    }

    deleteObject(object, forced) {
        if (! forced) {
            return knex(this.objectTableName).update({
                deleted_at: this.getNow()
            }).where('id', object.id)
        }

        return knex(this.objectTableName).where('id', object.id).del(object)
    }

    assignAction(workflow, action) {
        return knex(this.pivots.action)
            .where('action_id', action.id)
            .where('workflow_id', workflow.id)
            .first().then(result => {
                if (typeof result !== 'undefined') {
                    return result
                }

                return knex(this.pivots.action)
                    .insert({
                        action_id: action.id,
                        workflow_id: workflow.id
                    })
                    .returning(['action_id', 'workflow_id'])
            })
    }

    syncActions(workflow, actions) {
        const workFlowActions = actions.map(action => {
            return {
                workflow_id: workflow.id,
                action_id: action.id
            }
        })

        return knex(this.pivots.action).where({
            workflow_id: workflow.id
        }).del().then(() => {
            return knex(this.pivots.action).insert(workFlowActions)
        })
    }

    syncRuleActions(workflow, actions)
    {
        return this.syncActions(workflow, actions)
    }

    withdrawnAction(workflow, action) {
        return knex(this.pivots.action).where({
            workflow_id: workflow.id,
            action_id: action.id
        }).del()
    }
}

module.exports = WorkflowService

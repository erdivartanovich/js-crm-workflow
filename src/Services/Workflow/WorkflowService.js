'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class WorkflowService extends BaseService {

    constructor(rule, action, task) {
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
        return this.services.rule.edit(object)
    }

    addObject(workflow, object) {
        object.workflow_id = workflow.id

        return knex(this.objectTableName).insert(object)
    }

    editObject(object)
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

    listRules(workflow) {
        return this.services.rule.browse().whereIn('workflow_id', [workflow.id])
    }

    getRules(workflow) {
        return this.listRules(workflow)
    }

    listObjects(workflow) {
        return knex(this.objectTableName).whereIn('workflow_id', [workflow.id])
    }

    listActions(workflow) {
        return knex(this.pivots.action).where('workflow_id', workflow.id).then(actionWorkflows => {
            const ids = actionWorkflows.map(actionWorkflow => actionWorkflow.action_id)

            return this.services.action.browse().whereIn('id', ids)
        })
    }

    hasAction(workflow, actionId) {
        return knex(this.pivots.action).where({
            'workflow_id': workflow.id,
            'action_id': actionId,
        }).first().then(action => typeof action !== 'undefined')
    }

    getByIds(ids) {
        return this.browse().whereIn('id', ids)
    }

    copy(workflow, newOwner) {
        workflow.user_id = newOwner.id

        this.add(workflow).then(newWorkflow => {
            return new Promise((resolve, reject) => {
                if (typeof newWorkflow == 'undefined') {
                    reject(newWorkflow)
                }

                resolve(newWorkflow)
            })
        })
            .then((newWorkflow) => {
                return this.listActions(workflow).then(actions => {
                    this.copyActions(actions, newOwner).then(copiedAction => {
                        this.syncActions(newWorkflow, copiedAction)
                    })
                    return newWorkflow
                })
            })
            .then((newWorkflow) => {
                return this.listObjects(workflow).then(objects => {
                    objects.map(object => {
                        object.user_id = newWorkflow.id
                        this.add(object)
                    })
                })
            })
            .then(() => {
                //TODO
                //Get only root rules
            })
            .catch(err => {})
    }
}

module.exports = WorkflowService

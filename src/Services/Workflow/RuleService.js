'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class RuleService extends BaseService {

    constructor() {
        super()
        this.tableName = 'rules'
        this.ruleActionName = 'rule_action'
    }

    // TODO: implements syncActions, getParentsFor, getDependentRules, getRuleThatHasAction

    syncActions(rule, actions) {
        return knex.transaction(trx => {
            return trx.from(this.ruleActionName).where('rule_id', rule.id).delete().then(() => {
                return trx.insert(actions.map(data => {
                    data.rule_id = rule.id
                    return data
                })).into(this.ruleActionName)
            })
        })

    }

    getParent(rule) {
        if (rule.parent_id === null) {
            return Promise.resolve(null)
        }

        return this.read(rule.parent_id)
    }

    getParentsFor(rule, carry) {
        if (typeof carry == 'undefined') {
            carry = []
        }

        return this.getParent(rule).then(result => {
            if (result == null) {
                return carry
            }

            carry.push(result)

            return this.getParentsFor(result, carry)
        })
    }

    getDependentRules(workflow, action) {
        return this.getRuleWithParent(workflow)
            .then(result => {
                console.log('first....', result)
                const ids = []
                result.map(item => {
                    ids.push(item.id)
                })
                return this.getAssociatedRule(action, ids)
            })
            .then(result => {
                const rules = []
                result.map(item => {
                    rules.push(item.rule_id)
                })
                return this.getRuleObjects(rules)
            })
            .then(result => {
                const parentIds = []
                result.map(item => {
                    parentIds.push(item.parent_id)
                })
                return this.getRuleObjects(parentIds)
            })
            .catch(err => console.log(err))
    }

    getRuleWithParent(workflow) {
        return knex(this.tableName)
            .where('workflow_id', workflow.id)
            .whereNotNull('parent_id')
    }

    getAssociatedRule(action, ids) {
        return knex(this.ruleActionName)
            .whereIn('rule_id', ids)
            .where('action_id', action.id)
    }

    getRuleObjects(rules) {
        return knex(this.tableName)
            .whereIn('id', rules)
    }

    getParentRule(parentIds) {
        return knex(this.tableName)
            .whereIn('id', parentIds)
    }

    // getDependentRules() method using elasticsearch
    getRuleThatHasAction(workflow, action) {
        return knex(this.ruleActionName)
            .where('action_id', action.id)
            .then(result => {
                const ids = []
                result.map(res => {
                    ids.push(res.rule_id)
                })

                return knex(this.tableName)
                    .where('workflow_id', workflow.id)
                    .whereIn('id', ids)
            })
    }


}

module.exports = RuleService
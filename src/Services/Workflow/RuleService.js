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

        // const data = []
        
        // actions.map(function (action) {
        //     data.push({
        //         rule_id: rule.id,
        //         action_id: action.id,
        //     })
        // })

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

    // return knex(this.ruleActionName)
    //         .where('rule_id', rule.id).del()
    //         .then(() => {
    //             return knex(this.ruleActionName)
    //                 .insert(data)
    //         })
    // }

    getParent(rule) {
        if(! rule.parent_id) {
            return null
        }

        return this.read(rule.parent_id)
    }

    getParentsFor(rule) {
        const data = []
        data.push({
           parent_id: rule.parent_id
         })

        return knex(this.ruleActionName)
            .where('parent_id', rule.parent_id)
            .insert(data)
    }

    // getDependentRules() method using elasticsearch
    getRuleThatHasAction(workflow, action) {
        return knex()
            .where('workflow_id', workflow.id)
            .insert(workflow.id)
            .then(() => {
                return knex(this.ruleActionName)
                .where('action_id', action.id)
                .insert(action.id)
            })
    }


}

module.exports = RuleService

// let test = new RuleService()

// test.syncActions({
//     id: 7,
//     // 
// }, [
//     {id: 1},
//     {id: 2},
//     {id: 3}
// ])

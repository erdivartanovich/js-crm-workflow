'use strict'

const _ = require('lodash')
const moment = require('moment')
const DATEFORMAT = 'YYYY-MM-DD'
const container = require('../../di').container

const di = require('../../di')
const PersonService = require('../../Services/Person/PersonService')

const LOG_STATUS_SUCCESS = 1
const LOG_STATUS_FAILED = 0

class ActionResourcesJob {
    constructor(workflow, action, resources, rules, event) {
        this.workflow = workflow
        this.action = action
        this.resources = resources
        this.rules = rules

        this.event = event
    }

    runnableOnce(runnableOnce) {
        return this.runnableOnce = runnableOnce
    }

    handle(service) {
        this.taskService = container['TaskService']
        this.logService = container['LogService']
        this.ruleService = container['RuleService']
            // TODO:
        this.service = service

        this.event.run((states) => {
            if (!states['total']) {
                states['total'] = 0
            }

            states['total'] += this.resources.length

            this.event.emit('check')
        })

        _.map(this.resources, (resource) => {
            this.processResource(resource, service)
        })

    }

    finished() {
        // TODO: fix the implementation of Observer
        // this.event.emit('finished')
    }

    processResource(resource, service) {
        return this.logService.isRunned(this.workflow, this.action, resource)
            .then(exist => {
                //1. check run once
                if (exist && this.runnableOnce) {
                    this.finished()
                    return false
                } else {
                    //     //check for rule dependency
                    return this.ruleService.getDependentRules(this.workflow, this.action)
                        .then(dependentRules => {
                            // console.log(dependentRules)
                            if (dependentRules.length > 0) {
                                console.log('Rule dependency', dependentRules)
                                return this.logService.isParentRunned(this.workflow, this.action, resource, dependentRules)
                                    .then(exist => {
                                        if (!exist) {
                                            return this.log(resource, LOG_STATUS_FAILED, 'Dependent rule(s) not meet!')
                                                .then(() => {
                                                    this.finished()
                                                    return false
                                                })
                                        } else {
                                            return this.applyAction(resource, service)
                                        }
                                    })
                            } else {
                                //process action
                                return this.applyAction(resource, service)
                            }
                        })
                }

                // TODO:
                //2. check priority
                //3. check dependency rules

                //process action
                // return this.applyAction(resource, service)
            })
    }

    applyAction(resource, service) {
        let action = false
        const actionType = this.action.action_type

        switch (actionType) {
            case 1:
                this.actionUpdate(resource, service)
                action = true
                break
            case 2:
                this.actionExecute(resource)
                action = true
                break
            case 3:
                this.actionClone(resource)
                action = true
                break
            case 4:
                this.actionAssign(resource)
                action = true
                break
        }

        if (!action) {
            return this.log(resource, 0, 'No action applied')
        }

        return action
    }

    actionUpdate(resource, resourceService) {
        // @todo: clean up the bugs

        return this.getActionResource(resource, resourceService)
            .then(target => {
                target[this.action.target_field] = this.action.value

                return this.service.edit(target).then(() => {
                    return true
                })
            })
            .then(result => {
                if (result) {

                    return this.log(resource, 1, 'Target updated')
                        .then(() => {
                            this.finished()
                            return true
                        })
                } else {
                    return this.log(resource, LOG_STATUS_FAILED, 'Target updated failed')
                        .then(() => {
                            this.finished()
                            return false
                        })
                }
            })
    }

    actionExecute(resource) {
        let message = 'Action ' + this.action.target_field + ' on ' + this.action.target_class + ' not found !'

        if (typeof this.service[this.action.target_field] == 'function') {
            return this.getExecuteParams(resource)
                .then(params => {
                    return this.service[this.action.target_field].apply(this.service, params)
                })
                .then(result => {
                    if (result) {
                        return this.log(resource, LOG_STATUS_SUCCESS, `Action ${this.action.name} executed`)
                            .then(() => {
                                this.finished()
                                return Promise.resolve(true)
                            })
                    } else {
                        this.finished()
                        return this.log(resource, LOG_STATUS_FAILED, `Action ${this.action.target_field} on ${this.action.target_class} failed!`)
                    }

                })
        } else {
            return this.log(resource, LOG_STATUS_FAILED, message)
                .then(() => {
                    this.finished()
                    return Promise.resolve(false)
                })
        }
    }

    actionClone(resource) {
        // resource should be an object with person_id e.g {person_id: 1}
        const date = (new moment).add(5, 'days')
        return this.taskService.clone(this.getTask(this.action))
            .then(task => {
                task.user_id = this.workflow.user_id
                task.person_id = resource.person_id
                task.created_by = this.workflow.user_id
                task.updated_by = this.workflow.user_id
                task.due_date = date.format(DATEFORMAT)
                task.is_completed = 0
                task.status = 1

                return Promise.resolve(task)
            })
            .then(task => {
                return this.taskService.add(task)
            })
            .then(result => {
                if (result) {
                    return this.log(resource, 1, 'Task cloned.')
                        .then(() => {
                            this.finished()
                            return Promise.resolve(true)
                        })
                } else {
                    return this.log(resource, 0, 'Task clone failed!')
                        .then(() => {
                            this.finished()
                            return Promise.resolve(false)
                        })
                }
            })
    }

    actionAssign(resource) {

        //init date with 5 days value in timestamp format, use momentjs
        const date = (new moment).add(5, 'days')

        // init empty task object
        let task = {}

        // perform getTask from action
        return this.getTask(this.action)
            .then(result => {
                result.user_id = this.workflow.user_id
                result.updated_by = this.workflow.user_id
                result.due_date = date.format(DATEFORMAT)
                result.is_completed = 0
                result.status = 1

                task = result
                return result
            })
            .then(task => {
                return this.taskService.edit(task)

            })
            .then(result => {
                resource.tableName = this.taskService.tableName

                if (typeof result != 'undefined' && result !== null) {
                    //if result has valid value
                    //log and return true
                    return this.log(resource, 1, 'Task ' + task.task_action + ' assigned')
                        .then(() => {
                            this.finished()
                            return true
                        })
                } else {
                    return this.log(resource, 0, 'Task assign failed!')
                        .then(() => {
                            this.finished()
                            return false
                        })
                }
            })
    }

    getExecuteParams(resource) {
        let params = []

        params.push(this.workflow)
        params.push(this.action)
        params.push(resource)
        params.push(this.action.value)

        return Promise.resolve(params)
    }

    getActionResource(resource, resourceService) {
        const target = this.action.target_class
        const model = resourceService

        const relationMaps = resourceService.getRelationLists()

        // TODO: implement isJoined method
        // return this.isJoined(model, target)
        // .then(join => {
        //     return new Promise((resolve, reject) => {
        //         if(!join){
        //             const relation = relationMaps[target]
        //             model = this.setJoin(target, model, relation)
        //         }
        //         resolve(model)
        //     })
        // })

        return this.setCriteria(target, model, resource, relationMaps)
            .then(result => {
                return model.read(result.id)
            })
    }

    setJoin(target, model, relation) {

        let onKey
        let onValue
        const relations = {}
            // {key: val}
            // {table: {key: val}}

        _.map(relation, (value, key) => {
            if (typeof value === 'object') {
                onKey = Object.keys(value)[0]
                onValue = value[onKey]
                relations[onKey] = onValue

                model.join(key, relations, 'left')
            } else {
                relations[key] = value
                model.join(target, relations, 'left')
            }
        })

        return model
    }

    // TODO:
    // isJoined(model, table) {
    //     return knex('users')
    //         .join('contacts', 'users.id', '=', 'contacts.user_id')
    //         .select('users.id', 'contacts.phone').toSQL()
    // }

    getTask(action) {
        return this.taskService.read(action.task_id)
    }

    setCriteria(target, model, resource, relationMaps) {
        const relation = relationMaps[target]
        this.setJoin(target, model, relation)

        return model
            .where('persons.id', '=', resource.id)
            .where('persons.user_id', '=', this.workflow.user_id)
            .browse()
            .select(target + '.*')
            .first()
    }

    log(resource, status, loginfo) {
        return this.logService.doLog(
            this.workflow,
            this.action,
            this.rules,
            status,
            loginfo,
            resource.tableName,
            resource.id
        )
    }
}

module.exports = ActionResourcesJob
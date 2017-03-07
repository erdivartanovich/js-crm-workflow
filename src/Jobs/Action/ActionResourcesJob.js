'use strict'

const _ = require('lodash')
const moment = require('moment')
const DATEFORMAT = 'YYYY-MM-DD'
const container = require('../../di').container

class ActionResourcesJob {
    constructor(workflow, action, resources, rules) {
        this.workflow = workflow
        this.action = action
        this.resources = resources
        this.rules = rules
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

        _.map(this.resources, (resource) => {
            this.processResource(resource, service)
        })

    }

    processResource(resource, service) {
        return this.logService.isRunned(this.workflow, this.action, resource)
        .then(exist => {
            //1. check run once
            if(exist && this.runnableOnce) {
                return false
            }
            else{
                //process action
                return this.applyAction(resource, service)
            }

            // TODO:
            //2. check priority
            //3. check dependency rules
        })
    }

    applyAction(resource, service) {
        let action = false
        const actionType = this.action.action_type

        switch(actionType) {
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

        if(!action) {
            return this.log(resource, 0, 'No action applied')
        }

        return action
    }

    actionUpdate(resource, resourceService) {
        // @todo: clean up the bugs

        return this.getActionResource(resource, resourceService)
        .then(target => {
            target[this.action.target_field] = this.action.value
 
            return this.service.edit(target).then((res) => {
            })
        })
        .then(result => {
            if(result) {
                return this.log(resource, 1, 'Target updated')
                .then(() => {
                    return true
                })
            }
            else {
                return this.log(resource, 0, 'Target updated failed')
                .then(() => {
                    return false
                })
            }
        })
    }

    actionExecute(resource) {
        // console.log('Execute')
        let message = 'Action '+this.action.target_field+' on '+this.action.target_class+' not found !'

        if(typeof this.service[this.action.target_field] == 'function') {
            return this.getExecuteParams(resource)
            .then(params => {
                return this.service[this.action.target_field].apply(undefined, params)
            })
            .then(result => {
                if(result) {
                    return this.log(resource, 1, 'Action '+this.action.name+' executed')
                    .then(() => {
                        return true
                    })
                }
                else {
                    return this.log(resource, 0, 'Action '+this.action.target_field+' on '+this.action.target_class+' failed!')
                }

            })
        }
        else {
            return this.log(resource, 0, message)
            .then(() => {
                return false
            })
        }
    }

    actionClone(resource) {
        // console.log('Clone')
        const date = (new moment).add(5, 'days')
        return this.taskService.clone(this.getTask(this.action))
        .then(task => {
            task.user_id = this.workflow.user_id
            task.person_id = resource
            task.created_by = this.workflow.user_id
            task.updated_by = this.workflow.user_id
            task.due_date = date.format(DATEFORMAT)
            task.is_completed = 0
            task.status = 1

            return task
        })
        .then(task => {
            return this.taskService.add(task)
        })
        .then(result => {
            if(result) {
                return this.log(resource, 1, 'Task cloned.')
                .then(() => {
                    return true
                })
            }
            else {
                return this.log(resource, 0, 'Task clone failed!')
                .then(() => {
                    return false
                })
            }
        })
    }

    actionAssign(resource) {
        // console.log('Resource')
        const date = (new moment).add(5, 'days')
        let task = ({})
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
            if(result) {
                return this.log(resource, 1, 'Task '+task.task_action+' assigned')
                .then(() => {
                    return true
                })
            }
            else {
                return this.log(resource, 0, 'Task assign failed!')
                .then(() => {
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

        return params
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
            if(typeof value === 'object') {
                onKey = Object.keys(value)[0]
                onValue = value[onKey]
                relations[onKey] = onValue

                model.join(key, relations, 'left')
            }
            else {
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

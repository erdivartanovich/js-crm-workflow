'use strict'

const _ = require('lodash')
const knex = require('../../connection')
const moment = require('moment')
const DATEFORMAT = 'YYYY-MM-DD'

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

    handle(taskService, logService, ruleService) {
        this.taskService = taskService
        this.logService = logService
        this.ruleService = ruleService
        // TODO:
        // this.service = new TargetServiceFactory()

        _.map(this.resources, (resource) => {
            this.processResource(resource)
        })

    }

    processResource(resource) {
        return this.logService.isRunned(this.workflow, this.action, resource)
        .then(exist => {
            //1. check run once
            if(exist && this.runnableOnce) {
                return false
            }
            else{
                //process action
                return this.applyAction(resource)
            }

            // TODO:
            //2. check priority
            //3. check dependency rules
        })
    }

    applyAction(resource) {
        let action = false
        // const actionType = this.action.getActionType()
        const actionType = this.action.type //for testing

        switch(actionType) {
        case 1:
            this.actionUpdate(resource)
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
    }

    actionUpdate(resource) {
        // console.log('Update')
        return this.getActionResource(resource)
        .then(target => {
            return target.setAttribute(this.action.target_field, this.action.value)
        })
        .then(target => {
            return this.service.update(target)
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

    getTask(action) {
        return knex('tasks')
        .where('id', action.task_id)
        .first()
    }

    log(resource, status, loginfo) {
        return this.LogService.doLog(
            this.workflow,
            this.action,
            this.rules,
            status,
            loginfo,
            resource.getLoggableType(),
            resource.id
        )
    }
}

module.exports = ActionResourcesJob

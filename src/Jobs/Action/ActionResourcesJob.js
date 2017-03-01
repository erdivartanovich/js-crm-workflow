'use strict'

const _ = require('lodash')

class ActionResourcesJob {
    constructor(workflow, action, resources, rules) {
        this.workflow = workflow
        this.action = action
        this.resources = resources
        this.rules = rules
    }

    runnableOnce(runnableOnce) {
        this.runnableOnce = runnableOnce
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
        this.logService.isRunned(this.workflow, this.action, resource)
        .then(exist => {
            //1. check run once
            if(exist && this.runnableOnce) {
                return false
            }

            // TODO:
            //2. check priority
            //3. check dependency rules

            //process action
            return this.applyAction(resource)
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
            this.log(resource, 0, 'No action applied')
        }
    }

    actionUpdate(resource) {
        // console.log('Update')
        this.getActionResource(resource)
        .then(target => {
            target.setAttribute(this.action.getTargetField(), this.action.getValue())
        })
        .then(target => {
            this.service.update(target)
        })
        .then(result => {
            if(result) {
                this.log(resource, 1, 'Target updated')
                .then(() => {
                    return true
                })
            }
            this.log(resource, 0, 'Target updated failed')
            .then(() => {
                return false
            })
        })
    }

    actionExecute(resource) {
        // console.log('Execute');
        let message = 'Action '+this.action.target_field+' on '+this.action.target_class+' not found !'

        if(typeof this.service[this.action.target_field] == 'function') {
            this.getExecuteParams(resource)
            .then(params => {
                this.service[this.action.target_field].apply(undefined, params)
            })
            .then(result => {
                if(result) {
                    this.log(resource, 1, 'Action '+this.action.name+' executed')
                    .then(() => {
                        return true
                    })
                }
                this.log(resource, 0, 'Action '+this.action.target_field+' on '+this.action.target_class+' failed!')
            })
        }
        this.log(resource, 0, message)
        .then(() => {
            return false
        })
    }

    actionClone(resource) {
        // console.log('Clone')
    }

    actionAssign(resource) {
        // console.log('Resource')
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

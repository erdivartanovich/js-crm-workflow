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
        //1. check run once
        if(this.runnableOnce && this.logService.isRunned(this.workflow, this.action, resource)) {
            //log already run once
            this.log(resource, 0, 'Already run once !')

            return false
        }

        // TODO:
        //2. check priority
        //3. check dependency rules

        //process action
        return this.applyAction(resource)
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
        console.log('Update')
    }

    actionExecute(resource) {
        console.log('Execute');
    }

    actionClone(resource) {
        console.log('Clone')
    }

    actionAssign(resource) {
        console.log('Resource')
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

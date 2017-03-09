'use strict'
const ActionExecutor = require('../../Services/Action/ActionExecutor')
const WorkflowData = require('./WorkflowData')
const di = require('../../di')

class ActionCommand {

    constructor() {
        this.workflowData = new WorkflowData()
        this.workflowService = di.container['WorkflowService']
        this.actionService = di.container['ActionService']
    }

    handle(workflowId, actionId, isRunnableOnce) {
        // Get workflow from the inputted workflowId
        this.workflowService.read(workflowId)
        .then((workflow) => {
            this.workflowData.setWorkflow(workflow)
            // Check whether the workflow has action(actionId)
            return this.workflowService.hasAction(workflow, actionId)
        }).then(hasAction => {
            // Get action from actionId ...
            if (hasAction) {
                return this.actionService.read(actionId)
            }

            // ... or throw error if it doesn't connected to the workflow
            throw Error('Action is not related to the workflow')
        }).then(action => {
            // set action from actionId
            this.workflowData.setAction(action)

            const workflow = this.workflowData.getWorkflow()

            // Return objects and rules from workflow
            return Promise.all([
                this.workflowService.listObjects(workflow),
                this.workflowService.listRules(workflow)
            ])
        }).then(results => {
            // insert objects and rules into this.workflowData object
            this.workflowData.setObjects(results[0])
            this.workflowData.setRules(results[1])

            // Instantiate ActionExecutor and ...
            const executor = new ActionExecutor(
                this.workflowData.getWorkflow(),
                this.workflowData.getAction(),
                this.workflowData.getObjects(),
                this.workflowData.getRules()
            )

            // ... execute!
            isRunnableOnce ? executor.runnableOnce().execute() : executor.execute()
        }).catch(err => console.error(err))
    }
}

module.exports = ActionCommand

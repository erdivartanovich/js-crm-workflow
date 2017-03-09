'use strict'

class WorkflowData {
    constructor() {
        this.attributes = {}
    }

    setWorkflow(workflow) {
        this.attributes.workflow = workflow
    }

    getWorkflow() {
        return this.attributes.workflow
    }

    setObjects(objects) {
        this.attributes.objects = objects
    }

    getObjects() {
        return this.attributes.objects
    }

    setRules(rules) {
        this.attributes.rules = rules
    }

    getRules() {
        return this.attributes.rules
    }

    getAction() {
        return this.attributes.action
    }

    setAction(action) {
        this.attributes.action = action
    }
}

module.exports = WorkflowData

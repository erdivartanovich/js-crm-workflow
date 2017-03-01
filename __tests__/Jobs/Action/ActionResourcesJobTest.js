'use strict'

const basePath = '../../../src'
const ActionResourcesJob = require(basePath + '/Jobs/Action/ActionResourcesJob')
const PersonService = require(basePath + '/Services/Person/PersonService')
const LogService = require(basePath + '/Services/Workflow/LogService')
const WorkflowService = require(basePath + '/Services/Workflow/WorkflowService')
const TaskService = require(basePath + '/Services/Task/TaskService')

var tracker = require('mock-knex').getTracker()
var td = require('testdouble')

const workflow = {id: 4}
const action = {id: 7, task_id: 5, type: 5}
const resources = [{}]
const rules = [{}]

const testObj = new ActionResourcesJob(workflow, action, resources, rules)
const tableName = 'action_logs'

let model

describe('ActionResourcesJob', () => {

    before(() => {
        tracker.install()
        tracker.on('query', function checkResult(query) {
            query.response(query)
        })
    })

    after(() => {
        tracker.uninstall()
    })

    describe('#getTask()' , () => {
        it('should return a valid query', (done) => {
            const browseQuery = 'select * from `tasks` where `id` = ? limit ?'

            testObj.getTask(testObj.action).then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('first')
                result.bindings[0].should.equals(testObj.action.task_id)
                result.bindings[1].should.equals(1)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#processResource()', () => {
        const resource = td.object(PersonService)
        it('should return a valid object', () => {
            testObj.runnableOnce = true
            testObj.logService = new LogService()
            testObj.processResource(resource).should.be.empty
        })
    })

    describe('#applyAction()', () => {
        const resource = td.object(PersonService)

        it('should return a valid object', () => {
            testObj.logService = new LogService()
            testObj.applyAction(resource).should.be.instanceOf(Object)
        })
    })

    // TODO: need to implement model.leftJoin
    // describe('#actionUpdate()', () => {
    //     const resource = td.object(PersonService)
    //
    //     it('should return a valid object', () => {
    //         testObj.logService = new LogService()
    //         testObj.actionUpdate(resource).should.be.instanceOf(Object)
    //     })
    // })

    describe('#actionExecute()', () => {
        const resource = td.object(PersonService)

        it('should return a valid object', () => {
            testObj.logService = new LogService()
            testObj.service = new WorkflowService()
            testObj.actionExecute(resource).should.be.instanceOf(Object)
        })
    })

    describe('#actionClone()', () => {
        const resource = td.object(PersonService)

        it('should return a valid object', () => {
            testObj.logService = new LogService()
            testObj.taskService = new TaskService()
            testObj.actionClone(resource).should.be.instanceOf(Object)
        })
    })

    describe('#actionAssign()', () => {
        const resource = td.object(PersonService)

        it('should return a valid object', () => {
            testObj.logService = new LogService()
            testObj.actionAssign(resource).should.be.instanceOf(Object)
        })
    })

    describe('#getExecuteParams()', () => {
        const resource = td.object(PersonService)

        it('should return a valid object', () => {
            testObj.logService = new LogService()
            testObj.getExecuteParams(resource).should.be.instanceOf(Object)
        })
    })

    describe('#log()', () => {
        const resource = td.object(PersonService)

        it('should return a valid object', () => {
            testObj.log(resource, 1, 'Log info').should.be.instanceOf(Object)
        })
    })





    //  describe('#apply()', () => {
    //     model = td.object(WorkflowService)
    //     it('should return a valid object', () => {
    //         testObj.apply(model).should.be.an.instanceOf(Object)
    //     })
    // })
})

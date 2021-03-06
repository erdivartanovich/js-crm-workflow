'use strict'

const basePath = '../../../src'
const di = require(basePath + '/di')
const ActionResourcesJob = require(basePath + '/Jobs/Action/ActionResourcesJob')
const PersonService = require(basePath + '/Services/Person/PersonService')
const LogService = require(basePath + '/Services/Workflow/LogService')
const WorkflowService = require(basePath + '/Services/Workflow/WorkflowService')
const TaskService = require(basePath + '/Services/Task/TaskService')

var tracker = require('mock-knex').getTracker()
var td = require('testdouble')

const workflow = {id: 1, user_id: 6}
const action = {id: 1, type: 4, task_id: 1, target_class: 'person_addresses'}
const personService = di.container['PersonService']
const resources = ({})
const rules = [{id: 3}]

const testObj = new ActionResourcesJob(workflow, action, resources, rules)
const tableName = 'action_logs'

let model

describe('ActionResourcesJob', () => {

    before(() => {
        tracker.install()
        tracker.on('query', function checkResult(query, step) {

            if (step == 5 || step == 6 || step == 14 || step == 19 || step == 24) {
                query.response({
                    id: 2
                })
            }
            else {
                query.response(query)
            }
        })
    })

    after(() => {
        tracker.uninstall()
    })

    describe('#getTask()' , () => {
        it('should return a valid query', (done) => {
            const browseQuery = 'select * from `tasks` where `deleted_at` is null and `id` = ? limit ?'
            testObj.taskService = new TaskService()

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
            testObj.taskService = td.object(TaskService)
            testObj.applyAction(resource).should.be.instanceOf(Object)
        })
    })
    // TODO: setAttribute is not a function
    describe('#actionUpdate()', () => {
        const service = personService
        const resource = {id: 7}

        it('should return a valid object', () => {
            testObj.logService = new LogService()
            testObj.service = new WorkflowService()
            testObj.actionUpdate(resource, service).should.be.instanceOf(Object)
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

    describe('#setJoin()', (done) => {
        const resource = td.object(PersonService)

        it('should return a valid query', () => {
            const target = 'persons'
            const relation = {'person.id': 'workflow.id'}

            testObj.setJoin(target, resource, relation).should.be.instanceOf(Object)
        })
    })

    describe('#setCriteria()' , () => {
        it('should return a valid query', (done) => {
            const browseQuery = 'select person_addresses.*, persons.*, `person_addresses`.* from `persons` left join `person_addresses` on `persons`.`id` = `person_addresses`.`person_id` where `persons`.`deleted_at` is null and persons.id = ? and persons.user_id = ? limit ?'
            const target = testObj.action.target_class
            const model = personService
            const resources = {id: 4}
            const relationMaps = personService.getRelationLists()

            testObj.setCriteria(target, model, resources, relationMaps).then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('first')
                result.bindings[0].should.equals(4)
                result.bindings[1].should.equals(6)
                result.bindings[2].should.equals(1)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#log()', () => {
        const resource = td.object(PersonService)

        it('should return a valid object', () => {
            testObj.log(resource, 1, 'Log info').should.be.instanceOf(Object)
        })
    })
})
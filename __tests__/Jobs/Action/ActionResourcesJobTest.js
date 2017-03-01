'use strict'

const basePath = '../../../src'
const ActionResourcesJob = require(basePath + '/Jobs/Action/ActionResourcesJob')

var tracker = require('mock-knex').getTracker()
var td = require('testdouble')

const workflow = {id: 4}
const action = {id: 7, task_id: 5}
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

    //  describe('#apply()', () => {
    //     model = td.object(WorkflowService)
    //     it('should return a valid object', () => {
    //         testObj.apply(model).should.be.an.instanceOf(Object)
    //     })
    // })
})

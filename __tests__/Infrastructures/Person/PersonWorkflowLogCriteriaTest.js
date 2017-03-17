'use strict'

const basePath = '../../../src'
const PersonWorkflowLogCriteria = require(basePath + '/Infrastructures/Person/PersonWorkflowLogCriteria')
const WorkflowService = require(basePath + '/Services/Workflow/WorkflowService')
var tracker = require('mock-knex').getTracker()
var td = require('testdouble')

const workflow = { id: 4 }
const action = { id: 7 }

const testObj = new PersonWorkflowLogCriteria(workflow, action)
const tableName = 'action_logs'

let model

describe('PersonWorkflowLogCriteria', () => {

    before(() => {
        tracker.install()
        tracker.on('query', function checkResult(query) {
            query.response(query)
        })
    })

    after(() => {
        tracker.uninstall()
    })

    describe('#getExistLog()', () => {
        it('should return a valid query', (done) => {
            const browseQuery = 'select * from `' + tableName + '` where `workflow_id` = ? and `action_id` = ? and `status` = ?'

            testObj.getExistLog().then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')
                result.bindings[0].should.equals(testObj.workflow.id)
                result.bindings[1].should.equals(testObj.action.id)
                result.bindings[2].should.equals(1)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#apply()', () => {
        model = td.object(WorkflowService)
        it('should return a valid object', () => {
            testObj.apply(model).should.be.an.instanceOf(Object)
        })
    })
})
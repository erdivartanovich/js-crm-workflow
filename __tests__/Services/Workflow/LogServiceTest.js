'use strict'

const basePath = '../../../src'
const LogService = require(basePath + '/Services/Workflow/LogService')
var tracker = require('mock-knex').getTracker()

const testObj = new LogService()
const tableName = 'action_logs'

describe('LogService', () => {

    before(() => {
        tracker.install()

        tracker.on('query', function checkResult(query) {
            query.response(query)
        })
    })

    after(() => {
        tracker.uninstall()
    })

    describe('#browse()' , () => {
        it('should return a valid query', (done) => {
            const browseQuery = 'select * from `' + tableName + '` where `deleted_at` is null'

            testObj.browse(2).then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')
                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const readQuery = 'select * from `' + tableName + '` where `deleted_at` is null and `id` = ? limit ?'
            const readId = 2
            const limit = 1

            testObj.read(readId).then(result => {
                result.sql.should.equals(readQuery)
                result.method.should.equals('first')
                result.bindings[0].should.equals(readId)
                result.bindings[1].should.equals(limit)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#edit()' , () => {
        it('should return a valid query', (done) => {
            const editQuery = 'update `' + tableName + '` set `action_id` = ?, `id` = ?, `info` = ?, `status` = ?, `updated_at` = ?, `user_id` = ?, `workflow_id` = ? where `id` = ?'
            const editObject = {
                action_id: 1, id: 2, info: 'set set', status: 0, user_id: 1, workflow_id: 2
            }

            testObj.edit(editObject).then(result => {
                result.sql.should.equals(editQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(editObject.action_id)
                result.bindings[1].should.equals(editObject.id)
                result.bindings[2].should.equals(editObject.info)
                result.bindings[3].should.equals(editObject.status)
                result.bindings[5].should.equals(editObject.user_id)
                result.bindings[4].should.not.empty
                result.bindings[6].should.equals(editObject.workflow_id)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'insert into `' + tableName + '` (`action_id`, `created_at`, `info`, `status`, `updated_at`, `user_id`, `workflow_id`) values (?, ?, ?, ?, ?, ?, ?)'
            const addObject = {
                action_id: 4, info: 'alert', status: 'alert', user_id: 2, workflow_id: 3
            }

            testObj.add(addObject).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('insert')
                result.bindings[0].should.equals(addObject.action_id)
                result.bindings[1].should.not.empty
                result.bindings[2].should.equals(addObject.info)
                result.bindings[3].should.equals(addObject.status)
                result.bindings[4].should.not.empty
                result.bindings[5].should.equals(addObject.user_id)
                result.bindings[6].should.equals(addObject.workflow_id)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#delete()' , () => {
        it('should return a valid query for soft delete', (done) => {
            const deleteQuery = 'update `' + tableName + '` set `deleted_at` = ? where `id` = ?'
            const deleteId = 8

            testObj.delete({'id': deleteId}).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('update')
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })

        it('should return a valid query for forced delete', (done) => {
            const deleteQuery = 'delete from `' + tableName + '` where `id` = ?'
            const deleteId = 8

            testObj.delete({'id': deleteId}, true).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })

        it('should return a valid query for hard delete', (done) => {
            const deleteQuery = 'delete from `' + tableName + '` where `id` = ?'
            const deleteId = 8

            testObj.softDelete = false

            testObj.delete({'id': deleteId}).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })
    })
})

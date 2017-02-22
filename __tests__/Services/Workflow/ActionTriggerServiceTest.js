'use strict'

const sourcePath = '../../../src'
const ActionTriggerService = require(sourcePath + '/Services/Workflow/ActionTriggerService')
var tracker = require('mock-knex').getTracker()

const testObj = new ActionTriggerService()

describe('ActionTriggerService', () => {



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
            const browseQuery = 'select * from `action_triggers` where `deleted_at` is null'

            testObj.browse(2).then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')

                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const readQuery = 'select * from `action_triggers` where `deleted_at` is null and `id` = ? limit ?'
            const readId = 5
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
            const editQuery = 'update `action_triggers` set `action_id` = ?, `id` = ?, `updated_at` = ? where `id` = ?'
            const editObject = {
                id: 1, 'action_id': 77
            }

            testObj.edit(editObject).then(result => {
                result.sql.should.equals(editQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(editObject.action_id)
                result.bindings[1].should.equals(editObject.id)
                result.bindings[2].should.not.empty
                result.bindings[3].should.equals(editObject.id)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'insert into `action_triggers` (`action_id`, `created_at`, `updated_at`) values (?, ?, ?)'
            const addPersonId = 10

            testObj.add({'action_id': addPersonId}).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('insert')
                result.bindings[1].should.not.empty
                result.bindings[0].should.equals(addPersonId)
                result.bindings[2].should.not.empty

                done()
            }).catch(err => done(err))
        })
    })

    describe('#delete()' , () => {
        it('should return a valid query for soft delete', (done) => {
            const deleteQuery = 'update `action_triggers` set `deleted_at` = ? where `id` = ?'
            const deleteId = 12

            testObj.delete({'id': deleteId}).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('update')
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(deleteId)

                done()
            }).catch(err => done(err))
        })

        it('should return a valid query for forced delete', (done) => {
            const deleteQuery = 'delete from `action_triggers` where `id` = ?'
            const deleteId = 12

            testObj.delete({'id': deleteId}, true).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)

                done()
            }).catch(err => done(err))
        })
    })
})
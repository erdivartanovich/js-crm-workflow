'use strict'

const basePath = '../../../src'
const InteractionService = require(basePath + '/Services/Interaction/InteractionService')
var tracker = require('mock-knex').getTracker()

const testObj = new InteractionService()
const tableName = 'interactions'

describe('InteractionService', () => {

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
            const editQuery = 'update `' + tableName + '` set `id` = ?, `initiated_by` = ?, `interaction_type` = ?, `person_id` = ?, `phone_number` = ?, `updated_at` = ?, `user_id` = ? where `id` = ?'
            const editObject = {
                id: 1, initiated_by: 3, interaction_type: 3, person_id: 57, phone_number: '080808080', user_id: 5
            }

            testObj.edit(editObject).then(result => {
                result.sql.should.equals(editQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(editObject.id)
                result.bindings[1].should.equals(editObject.initiated_by)
                result.bindings[2].should.equals(editObject.interaction_type)
                result.bindings[3].should.equals(editObject.person_id)
                result.bindings[4].should.equals(editObject.phone_number)
                result.bindings[5].should.not.empty
                result.bindings[6].should.equals(editObject.user_id)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'insert into `' + tableName + '` (`created_at`, `initiated_by`, `interaction_type`, `person_id`, `phone_number`, `updated_at`, `user_id`) values (?, ?, ?, ?, ?, ?, ?)'
            const addObject = {
                initiated_by: 4, interaction_type: 4, person_id: 57, phone_number: '07232153245', user_id: 3
            }

            testObj.add(addObject).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('insert')
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(addObject.initiated_by)
                result.bindings[2].should.equals(addObject.interaction_type)
                result.bindings[3].should.equals(addObject.person_id)
                result.bindings[4].should.equals(addObject.phone_number)
                result.bindings[5].should.not.empty
                result.bindings[6].should.equals(addObject.user_id)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#delete()' , () => {
        it('should return a valid query for soft delete', (done) => {
            const deleteQuery = 'update `' + tableName + '` set `deleted_at` = ? where `id` = ?'
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
            const deleteQuery = 'delete from `' + tableName + '` where `id` = ?'
            const deleteId = 12

            testObj.delete({'id': deleteId}, true).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })

        it('should return a valid query for hard delete', (done) => {
            const deleteQuery = 'delete from `' + tableName + '` where `id` = ?'
            const deleteId = 12

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

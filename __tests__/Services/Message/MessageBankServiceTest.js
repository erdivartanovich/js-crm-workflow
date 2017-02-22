'use strict'

const sourcePath = '../../../src'
const MessageBankService = require(sourcePath + '/Services/Message/MessageBankService')
var tracker = require('mock-knex').getTracker()

const testObj = new MessageBankService()

describe('MessageBankService', () => {



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
            const browseQuery = 'select * from `message_bank` where `deleted_at` is null'

            testObj.browse(2).then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')

                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const readQuery = 'select * from `message_bank` where `deleted_at` is null and `id` = ? limit ?'
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
            const editQuery = 'update `message_bank` set `id` = ?, `message_type` = ?, `updated_at` = ? where `id` = ?'
            const editObject = {
                id: 1, 'message_type': 2
            }

            testObj.edit(editObject).then(result => {
                result.sql.should.equals(editQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(editObject.id)
                result.bindings[1].should.equals(editObject.message_type)
                result.bindings[2].should.equals(testObj.getNow())
                result.bindings[3].should.equals(editObject.id)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'insert into `message_bank` (`created_at`, `message_type`, `updated_at`) values (?, ?, ?)'
            const addPersonId = 1

            testObj.add({'message_type': addPersonId}).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('insert')
                result.bindings[0].should.equals(testObj.getNow())
                result.bindings[1].should.equals(addPersonId)
                result.bindings[2].should.equals(testObj.getNow())

                done()
            }).catch(err => done(err))
        })
    })

    describe('#delete()' , () => {
        it('should return a valid query for soft delete', (done) => {
            const deleteQuery = 'update `message_bank` set `deleted_at` = ? where `id` = ?'
            const deleteId = 12

            testObj.delete({'id': deleteId}).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(testObj.getNow())
                result.bindings[1].should.equals(deleteId)

                done()
            }).catch(err => done(err))
        })

        it('should return a valid query for forced delete', (done) => {
            const deleteQuery = 'delete from `message_bank` where `id` = ?'
            const deleteId = 12

            testObj.delete({'id': deleteId}, true).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#incUsageCount()' , () => {
        it('should return a valid query', (done) => {
            const incQuery = 'update `message_bank` set `usage_count` = `usage_count` + 1 where `id` = ?'
            const incObject = {
                id: 3
            }

            testObj.incUsageCount(incObject).then(result => {
                result.sql.should.equals(incQuery)
                result.method.should.equals('counter')
                result.bindings[0].should.equals(incObject.id)

                done()
            }).catch(err => done(err))
        })
    })
})
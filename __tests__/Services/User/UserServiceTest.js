'use strict'

const basePath = '../../../src'
const UserService = require(basePath + '/Services/User/UserService')
var tracker = require('mock-knex').getTracker()

const testObj = new UserService()
const tableName = testObj.tableName

describe('UserService', () => {

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
            const expectedQuery = 'select * from `' + tableName + '` where `deleted_at` is null'
            
            testObj.browse().then((result) => {
                result.sql.should.equals(expectedQuery)
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
            const editQuery = 'update `' + tableName + '` set `email` = ?, `first_name` = ?, `id` = ?, `last_name` = ?, `updated_at` = ? where `id` = ?'
            const editObject = {
                id: 3,
                email: 'jeffrey@example.com',
                first_name: 'Jeffrey',
                last_name: 'Way'
            }

            testObj.edit(editObject).then(result => {
                result.sql.should.equals(editQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(editObject.email)
                result.bindings[1].should.equals(editObject.first_name)
                result.bindings[2].should.equals(editObject.id)
                result.bindings[3].should.equals(editObject.last_name)
                result.bindings[4].should.not.empty
                result.bindings[5].should.equals(editObject.id)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const insertQuery = 'insert into `' + tableName + '` (`created_at`, `email`, `first_name`, `last_name`, `updated_at`) values (?, ?, ?, ?, ?)'
            const testUser = {
                email: 'winteriscoming@north.got',
                first_name: 'Brandon',
                last_name: 'Stark',
            }

            testObj.add(testUser).then(result => {
                result.sql.should.equals(insertQuery)
                result.method.should.equals('insert')
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(testUser.email)
                result.bindings[2].should.equals(testUser.first_name)
                result.bindings[3].should.equals(testUser.last_name)
                result.bindings[4].should.not.empty
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

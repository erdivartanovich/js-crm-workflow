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
                result.bindings[4].should.equals(testObj.getNow())
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
                result.bindings[0].should.equals(testObj.getNow())
                result.bindings[1].should.equals(testUser.email)
                result.bindings[2].should.equals(testUser.first_name)
                result.bindings[3].should.equals(testUser.last_name)
                result.bindings[4].should.equals(testObj.getNow())
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
                result.bindings[0].should.equals(testObj.getNow())
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

    describe('#retrieveByToken()', () => {
        it('should return a valid query', (done) => {
            const token = 'testToken'
            const id = 1
            const query = 'select * from `users` where `deleted_at` is null and `id` = ? and `remember_token` = ? limit ?'

            testObj.retrieveByToken(id, token).then(result => {
                result.sql.should.equals(query)
                result.method.should.equals('first')
                result.bindings[0].should.equals(id)
                result.bindings[1].should.equals(token)
                result.bindings[2].should.equals(1)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#retrieveByCredentials()', () => {
        it('should return a valid query', (done) => {
            const query = 'select * from `users` where `email` = ? and `deleted_at` is null limit ?'
            const credentials = {
                email: 'test@example.com'
            }

            testObj.retrieveByCredentials(credentials).then(result => {
                result.sql.should.equals(query)
                result.method.should.equals('first')
                result.bindings[0].should.equals(credentials.email)
                result.bindings[1].should.equals(1)
                done()
            }).catch(err => done(err))
        })

        it('should return a valid query when password passed', (done) => {
            const query = 'select * from `users` where `email` = ? and `deleted_at` is null limit ?'
            const credentials = {
                email: 'test@example.com',
                password: 'passwordIsIgnored',
            }

            testObj.retrieveByCredentials(credentials).then(result => {
                result.sql.should.equals(query)
                result.method.should.equals('first')
                result.bindings[0].should.equals(credentials.email)
                result.bindings[1].should.equals(1)
                done()
            }).catch(err => done(err))
        })
    })
})

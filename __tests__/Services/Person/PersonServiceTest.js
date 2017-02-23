'use strict'

const basePath = '../../../src'
const PersonService = require(basePath + '/Services/Person/PersonService')
var tracker = require('mock-knex').getTracker()

const testClass = new PersonService()
const tableName = testClass.tableName

describe('=== PersonService Test ===', () => {

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
            const query = 'select * from `' + tableName + '` where `deleted_at` is null'

            testClass.browse().then(result => {
                result.sql.should.equals(query)
                result.method.should.equals('select')
                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const query = 'select * from `' + tableName + '` where `deleted_at` is null and `id` = ? limit ?'
            const id = 1
            const limit = 1

            testClass.read(id).then(result => {
                result.sql.should.equals(query)
                result.method.should.equals('first')
                result.bindings[0].should.equals(id)
                result.bindings[1].should.equals(limit)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#edit()' , () => {
        it('should return a valid query', (done) => {
            const query = 'update `' + tableName + '` set `date_of_birth` = ?, `first_name` = ?, `id` = ?, `is_pre_approved` = ?, `is_primary` = ?, `last_name` = ?, `middle_name` = ?, `updated_at` = ? where `id` = ?' 
            const mockObject = {
                id: 1, first_name: 'teguh', middle_name: 'muhammad ', last_name: 'sobari', 
                date_of_birth: '1990-05-23', is_pre_approved: true, is_primary: true}
 
            testClass.edit(mockObject).then(result => {
                result.sql.should.equals(query)
                result.method.should.equals('update')
                result.bindings[0].should.equals(mockObject.date_of_birth)
                result.bindings[1].should.equals(mockObject.first_name)
                result.bindings[2].should.equals(mockObject.id)
                result.bindings[3].should.equals(mockObject.is_pre_approved)
                result.bindings[4].should.equals(mockObject.is_primary)
                result.bindings[5].should.equals(mockObject.last_name)
                result.bindings[6].should.equals(mockObject.middle_name)
                result.bindings[8].should.equals(mockObject.id)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const query = 'insert into `'+ tableName +'` (`created_at`, `date_of_birth`, `first_name`, `id`, `is_pre_approved`, `is_primary`, `last_name`, `middle_name`, `updated_at`) values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            const mockObject = {
                id: 1, first_name: 'teguh', middle_name: 'muhammad ', last_name: 'sobari', 
                date_of_birth: '1990-05-23', is_pre_approved: true, is_primary: true}
            
            testClass.add(mockObject).then(result => {
                result.sql.should.equals(query)
                result.method.should.equals('insert')
                result.bindings[1].should.equals(mockObject.date_of_birth)
                result.bindings[2].should.equals(mockObject.first_name)
                result.bindings[3].should.equals(mockObject.id)
                result.bindings[4].should.equals(mockObject.is_pre_approved)
                result.bindings[5].should.equals(mockObject.is_primary)
                result.bindings[6].should.equals(mockObject.last_name)
                result.bindings[7].should.equals(mockObject.middle_name)
                                                 
                done()
            }).catch(err => done(err))
        })
    })

    describe('#delete()' , () => {
        it('should return a valid query for soft delete', (done) => {
            const deleteQuery = 'update `' + tableName + '` set `deleted_at` = ? where `id` = ?'
            const deleteId = 12

            testClass.delete({'id': deleteId}).then(result => {
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

            testClass.delete({'id': deleteId}, true).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })

        it('should return a valid query for hard delete', (done) => {
            const deleteQuery = 'delete from `' + tableName + '` where `id` = ?'
            const deleteId = 12

            testClass.softDelete = false

            testClass.delete({'id': deleteId}).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })
    })

})

'use strict'

const basePath = '../../../src'
const PersonScoreService = require(basePath + '/Services/Person/PersonScoreService')
var tracker = require('mock-knex').getTracker()

const testClass = new PersonScoreService()
const tableName = testClass.tableName

describe('=== PersonScoreService Test ===', () => {

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
            const query = 'update `' + tableName + '` set `id` = ?, `model_applied` = ?, `person_id` = ?, `score` = ?, `score_type` = ?, `updated_at` = ? where `id` = ?' 
            const mockObject = {id: 1, person_id: 45, score_type: 1, model_applied: 'Model CRMFoundationlied', score: 4.3}
 
            testClass.edit(mockObject).then(result => {
                result.sql.should.equals(query)
                result.method.should.equals('update')
                result.bindings[0].should.equals(mockObject.id)
                result.bindings[1].should.equals(mockObject.model_applied)
                result.bindings[2].should.equals(mockObject.person_id)
                result.bindings[3].should.equals(mockObject.score)
                result.bindings[4].should.equals(mockObject.score_type)
                
                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const query = 'insert into `'+ tableName +'` (`created_at`, `id`, `model_applied`, `person_id`, `score`, `score_type`, `updated_at`) values (?, ?, ?, ?, ?, ?, ?)'
            const mockObject = {id: 1, person_id: 45, score_type: 1, model_applied: 'Model CRMFoundationlied', score: 4.3}
            
            testClass.add(mockObject).then(result => {
                result.sql.should.equals(query)
                result.method.should.equals('insert')
                result.bindings[1].should.equals(mockObject.id)
                result.bindings[2].should.equals(mockObject.model_applied)
                result.bindings[3].should.equals(mockObject.person_id)
                result.bindings[4].should.equals(mockObject.score)
                result.bindings[5].should.equals(mockObject.score_type)
                                                 
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

'use strict'

const basePath = '../../src'
const BaseService = require(basePath + '/Services/BaseService')
var tracker = require('mock-knex').getTracker()

const testClass = new BaseService()
const tableName = testClass.tableName

describe('====== BaseServiceTest ========', () => {

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
            testClass.browse().then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')
                done()
            }).catch(err => done(err))    
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            
        })
    })

    describe('#edit()' , () => {
        it('should return a valid query', (done) => {
            c
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            
        })
    })

    describe('#delete()' , () => {
        it('should return a valid query for soft delete', (done) => {
            
        })

        it('should return a valid query for forced delete', (done) => {
            
        })

        it('should return a valid query for hard delete', (done) => {
            
        })
    })


})

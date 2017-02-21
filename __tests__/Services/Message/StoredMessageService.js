'use strict'

const basePath = '../../../src'
const StoredMessageService = require(basePath + '/Services/Message/StoredMessageService')
var tracker = require('mock-knex').getTracker()

const testClass = new StoredMessageService()
const tableName = testClass.tableName

describe('StoredMessageService', () => {

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

})
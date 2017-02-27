'use strict'

const basePath = '../../../src'
const ReferralService = require(basePath + '/Services/Referral/ReferralService')
var tracker = require('mock-knex').getTracker()

const testObj = new ReferralService()
const tableName = 'referrals'

describe('ReferralService', () => {

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

            testObj.browse(5).then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')
                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const readQuery = 'select * from `' + tableName + '` where `deleted_at` is null and `id` = ? limit ?'
            const readId = 4
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
            const editQuery = 'update `' + tableName + '` set `id` = ?, `updated_at` = ?, `user_id` = ? where `id` = ?'
            const editObject = {
                user_id: 7, id: 3
            }

            testObj.edit(editObject).then(result => {
                result.sql.should.equals(editQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(editObject.id)
                result.bindings[1].should.not.empty
                result.bindings[2].should.equals(editObject.user_id)
                result.bindings[3].should.equals(editObject.id)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'insert into `' + tableName + '` (`action_id`, `created_at`, `updated_at`) values (?, ?, ?)'
            const addObject = {
                action_id: 40
            }

            testObj.add(addObject).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('insert')
                result.bindings[0].should.equals(addObject.action_id)
                result.bindings[1].should.not.empty
                result.bindings[2].should.not.empty
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

    describe('#sync()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'insert into `' + tableName + '` (`referrerable_id`, `referrerable_type`, `source_id`, `source_type`) values (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)'
            const referrerable = {
                referrerable_id: 2,
                referrerable_type: 'persons'
            }

            const sources = [
                {
                    source_id: 5,
                    source_type: 'users' 
                },
                {
                    source_id: 18,
                    source_type: 'sources' 
                },
                {
                    source_id: 19,
                    source_type: 'sources' 
                },
            ]

            testObj.sync(referrerable, sources).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('insert')
                result.bindings[0].should.equals(referrerable.referrerable_id)
                result.bindings[1].should.equals(referrerable.referrerable_type)
                result.bindings[2].should.equals(sources[0].source_id)
                result.bindings[3].should.equals(sources[0].source_type)
                result.bindings[4].should.equals(referrerable.referrerable_id)
                result.bindings[5].should.equals(referrerable.referrerable_type)
                result.bindings[6].should.equals(sources[1].source_id)
                result.bindings[7].should.equals(sources[1].source_type)
                result.bindings[8].should.equals(referrerable.referrerable_id)
                result.bindings[9].should.equals(referrerable.referrerable_type)
                result.bindings[10].should.equals(sources[2].source_id)
                result.bindings[11].should.equals(sources[2].source_type)
                
                done()
            }).catch(err => done(err))
        })
    })

    describe('#addNew()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'select * from `referrals` order by `id` desc limit ?'
            const source = {
                id: 4
            }

            const referrer = {
                id: 6
            }

            const newObject = {
                source_id: source.id,
                source_type: 'sources',
                referrerable_id: referrer.id,
                referrerable_type: 'persons'
            }

            testObj.addNew(source, referrer, newObject).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('first')
                result.bindings[0].should.equals(1)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#resetPrimary()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'update `' + tableName + '` set `is_primary` = ? where `referrerable_id` = ? and `referrerable_type` = ? and `is_primary` = ?'
            const referral = {
                id: 10,
                referrerable_id: 19 ,
                referrerable_type: 'persons'
            }

            testObj.resetPrimary(referral).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(0)
                result.bindings[1].should.equals(referral.referrerable_id)
                result.bindings[2].should.equals(referral.referrerable_type)
                result.bindings[3].should.equals(1)
                
                done()
            }).catch(err => done(err))
        })
    })

    describe('#getBy()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'select * from `' + tableName + '` where `source_id` = ? and `source_type` = ? and `referrerable_id` = ? and `referrerable_type` = ? limit ?'
            const source = {
                id: 4
            }

            const referrer = {
                id: 6
            }

            testObj.getBy(source, referrer).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('first')
                result.bindings[0].should.equals(source.id)
                result.bindings[1].should.equals('sources')
                result.bindings[2].should.equals(referrer.id)
                result.bindings[3].should.equals('persons')
                result.bindings[4].should.equals(1)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#setAsPrimary()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'update `' + tableName + '` set `is_primary` = ? where `id` = ?'
            const referral = {
                id: 10,
                referrerable_id: 19 ,
                referrerable_type: 'persons'
            }

            testObj.setAsPrimary(referral).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(1)
                result.bindings[1].should.equals(referral.id)

                done()
            }).catch(err => done(err))
        })
    })
})

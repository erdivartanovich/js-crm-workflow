'use strict'

const sourcePath = '../../../src'
var tracker = require('mock-knex').getTracker()

const di = require(sourcePath + '/di')

const testObj = di.container['WorkflowService']

describe('WorkflowService', () => {

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
            const browseQuery = 'select * from `workflows` where `deleted_at` is null'

            testObj.browse(2).then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')

                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const readQuery = 'select * from `workflows` where `deleted_at` is null and `id` = ? limit ?'
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
            const editQuery = 'update `workflows` set `action_id` = ?, `id` = ?, `updated_at` = ? where `id` = ?'
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
            const addQuery = 'insert into `workflows` (`action_id`, `created_at`, `updated_at`) values (?, ?, ?)'
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
            const deleteQuery = 'update `workflows` set `deleted_at` = ? where `id` = ?'
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
            const deleteQuery = 'delete from `workflows` where `id` = ?'
            const deleteId = 12

            testObj.delete({'id': deleteId}, true).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#addRule', () => {
        it('should return a valid query', done => {
            const expectedQuery = 'insert into `rules` (`created_at`, `id`, `updated_at`, `workflow_id`) values (?, ?, ?, ?)'

            testObj.addRule({id: 1}, {id: 10}).then(result => {
                result.sql.should.equals(expectedQuery)
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(10)
                result.bindings[2].should.not.empty
                result.bindings[3].should.equals(1)
                result.method.should.equals('insert')
                done()
            }).catch(err => done(err))
        })
    })

    describe('#deleteRule', () => {
        it('should return a valid query for forced', done => {
            const expectedQuery = 'delete from `rules` where `id` = ?'

            testObj.deleteRule({id: 1}, true).then(result => {
                result.sql.should.equals(expectedQuery)
                result.bindings[0].should.equals(1)
                result.method.should.equals('del')
                done()
            }).catch(err => done(err))
        })

        it('should return a valid query for not forced', done => {
            const expectedQuery = 'update `rules` set `deleted_at` = ? where `id` = ?'

            testObj.deleteRule({id: 1}).then(result => {
                result.sql.should.equals(expectedQuery)
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(1)
                result.method.should.equals('update')
                done()
            }).catch(err => done(err))
        })
    })

    describe('#editRule', () => {
        const object = {
            id: 5,
            workflow_id: 3,
            object_class: 'persons.target_id',
            object_type: 4,
        }

        it('should return a valid query', done => {
            testObj.editRule(object).then(query => {
                query.sql.should.equals('update `rules` set `id` = ?, `object_class` = ?, `object_type` = ?, `updated_at` = ?, `workflow_id` = ? where `id` = ?')
                done()
            }).catch(err => done(err))
        })
    })
})

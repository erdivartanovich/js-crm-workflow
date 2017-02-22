'use strict'

const sourcePath = '../../../src'
const PersonMotivationService = require(sourcePath + '/Services/Person/PersonMotivationService')
var tracker = require('mock-knex').getTracker()

const testObj = new PersonMotivationService()

describe('PersonMotivationService', () => {


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
            const browseQuery = 'select * from `person_motivations` where `deleted_at` is null'

            testObj.browse(2).then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')

                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const readQuery = 'select * from `person_motivations` where `deleted_at` is null and `id` = ? limit ?'
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
            const editQuery = 'update `person_motivations` set `id` = ?, `person_id` = ?, `updated_at` = ? where `id` = ?'
            const editObject = {
                id: 1, 'person_id': 44
            }

            testObj.edit(editObject).then(result => {
                result.sql.should.equals(editQuery)
                result.method.should.equals('update')
                result.bindings[1].should.equals(editObject.person_id)
                result.bindings[0].should.equals(editObject.id)
                result.bindings[2].should.not.empty
                result.bindings[3].should.equals(editObject.id)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'insert into `person_motivations` (`created_at`, `person_id`, `updated_at`) values (?, ?, ?)'
            const addPersonId = 15

            testObj.add({'person_id': addPersonId}).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('insert')
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(addPersonId)
                result.bindings[2].should.not.empty

                done()
            }).catch(err => done(err))
        })
    })

    describe('#delete()' , () => {
        it('should return a valid query for soft delete', (done) => {
            const deleteQuery = 'update `person_motivations` set `deleted_at` = ? where `id` = ?'
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
            const deleteQuery = 'delete from `person_motivations` where `id` = ?'
            const deleteId = 12

            testObj.delete({'id': deleteId}, true).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)

                done()
            }).catch(err => done(err))
        })
    })

     describe('#sync()' , () => {
        it('should return valid query for sync', (done) => {
            const person = {
                id: 20
            }
            const motivations = [
            {
                    id: 3
                },
                {
                    id: 4
                },
                {
                    id: 5    
                }
            ]

            const deleteQuery = 'insert into `person_motivations` (`id`, `person_id`) values (?, ?), (?, ?), (?, ?)'
            testObj.sync(person, motivations).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('insert')
                result.bindings[1].should.equals(person.id)
                result.bindings[0].should.equals(motivations[0].id)
                result.bindings[3].should.equals(person.id)
                result.bindings[2].should.equals(motivations[1].id)
                result.bindings[5].should.equals(person.id)
                result.bindings[4].should.equals(motivations[2].id)

                done()
            }).catch(err => done(err))
        })
    })
})
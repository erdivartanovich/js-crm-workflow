
'use strict'
const basePath = '../../../src'
const ObjectCustomFieldService = require(basePath + '/Services/CustomField/ObjectCustomFieldService')
var tracker = require('mock-knex').getTracker()

const testObj = new ObjectCustomFieldService()
const tableName = 'object_custom_fields'

describe('ObjectCustomFieldService', () => {

    before(() => {
        tracker.install()

        tracker.on('query', function checkResult(query, step) {
            // console.log('Step: '+step)
            if(step == 7) {
                query.response({
                    user_id: 2,
                    custom_field_id: 2,
                    object_id: 2,
                    object_type: 'persons',
                })    
            }
            query.response(query)
        })
    })

    after(() => {
        tracker.uninstall()
    })

    describe('#browse()' , () => {
        it('should return a valid query', (done) => {
            const browseQuery = 'select * from `' + tableName + '` where `deleted_at` is null'

            testObj.browse().then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')
                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const query = 'select * from `' + tableName + '` where `deleted_at` is null and `id` = ? limit ?'
            const id = 2
            const limit = 1

            testObj.read(id).then(result => {
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
            const editQuery = 'update `' + tableName + '` set `custom_custom_field_id` = ?, `id` = ?, `object_type` = ?, `updated_at` = ? where `id` = ?'
            const editObject = {
                custom_custom_field_id: 1, id: 2, object_type: 'persona'
            }

            testObj.edit(editObject).then(result => {
                result.sql.should.equals(editQuery)
                result.method.should.equals('update')
                result.bindings[0].should.equals(editObject.custom_custom_field_id)
                result.bindings[1].should.equals(editObject.id)
                result.bindings[2].should.equals(editObject.object_type)
                result.bindings[3].should.not.empty
                result.bindings[4].should.equals(editObject.id)
                done()
            }).catch(err => done(err))
        })
    })

    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const addQuery = 'insert into `' + tableName + '` (`created_at`, `custom_field_id`, `object_type`, `updated_at`) values (?, ?, ?, ?)'
            const addObject = {
                custom_field_id: 2, object_type: 'persona'
            }

            testObj.add(addObject).then(result => {
                result.sql.should.equals(addQuery)
                result.method.should.equals('insert')
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(addObject.custom_field_id)
                result.bindings[2].should.equals(addObject.object_type)
                result.bindings[3].should.not.empty
                done()
            }).catch(err => done(err))
        })
    })

    describe('#delete()' , () => {
        it('should return a valid query for soft delete', (done) => {
            const deleteQuery = 'update `' + tableName + '` set `deleted_at` = ? where `id` = ?'
            const deleteId = 1

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
            const deleteId = 1

            testObj.delete({'id': deleteId}, true).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })

        it('should return a valid query for hard delete', (done) => {
            const deleteQuery = 'delete from `' + tableName + '` where `id` = ?'
            const deleteId = 1

            testObj.softDelete = false

            testObj.delete({'id': deleteId}).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })

    })

    // describe('#getFieldValue()', () => {
    //     it('should return object if data exist', done => {
    //         const query = 'select * from `' + tableName + '` where `custom_field_id` = ? and `object_id` = ? and `object_type` = ? `user_id` = ? limit ?'
    //         const limit = 1
    //         const object = { object_id: 2, object_type: 'persons' }
    //         const customField = { custom_field_id: 2 }
    //         const user = { user_id: 2 }

    //         testObj.getFieldValue(customField, object, user).then(result => {
    //             result.sql.should.equals(query)
    //             result.method.should.equals('first')
    //             result.bindings[0].should.equals(customField.custom_field_id)
    //             result.bindings[1].should.equals(object.object_id)
    //             result.bindings[2].should.equals(object.object_type)
    //             result.bindings[3].should.equals(user.user_id)
    //             result.bindings[4].should.equals(limit)
    //             done()
    //         }).catch(err => done(err))
    //     })
        
    //     it('should return a valid query ', done => {
    //         const addQuery = 'insert into `' + tableName + '` (`created_at`, `custom_field_id`, `custom_field_value`, `object_id`, `object_type`, `updated_at`, `user_id`) values (?, ?, ?, ?, ?, ?, ?)'
    //         const object = { object_id: 2, object_type: 'persons' }
    //         const customField = { custom_field_id: 2 }
    //         const user = { user_id: 2 }
    //         const customfieldValue = ''
    //         testObj.getFieldValue(customField, object, user).then(result => {
    //             result.sql.should.equals(addQuery)
    //             result.method.should.equals('insert')
    //             result.bindings[0].should.not.empty
    //             result.bindings[1].should.equals(customField.custom_field_id)
    //             result.bindings[2].should.equals(customfieldValue)
    //             result.bindings[3].should.equals(object.object_id)
    //             result.bindings[4].should.equals(object.object_type)
    //             result.bindings[5].should.not.empty
    //             result.bindings[6].should.equals(user.user_id)
    //             done()
    //         }).catch(err => done(err))

    //     })
    // })

})

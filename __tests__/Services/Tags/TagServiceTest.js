const basePath = '../../../src'
const TagService = require(basePath + '/Services/Tags/TagService')
var tracker = require('mock-knex').getTracker()

const testObj = new TagService()
const expectQuery = {
    browse: 'select * from `tags` where `deleted_at` is null',
    read: 'select * from `tags` where `deleted_at` is null and `id` = ? limit ?',
    edit: 'update `tags` set `id` = ?, `tag` = ?, `updated_at` = ? where `id` = ?',
    add: 'insert into `tags` (`created_at`, `tag`, `updated_at`) values (?, ?, ?)',
    del: 'update `tags` set `deleted_at` = ? where `id` = ?'
}

describe('TagService', () => {

    before(() => {
        tracker.install()

        tracker.on('query', function checkResult(query) {
            query.response(query)
        })
    })

    after(() => {
        tracker.uninstall()
    })

// browse test that read all of data on DB
    describe('#browse()' , () => {
        it('should return a valid query', (done) => {
            testObj.browse(2).then(result => {
                result.sql.should.equals(expectQuery.browse)
                result.method.should.equals('select')
                done()
            }).catch(err => done(err))
        })
    })

// read test that read a row data
    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const readId = 2
            const limit = 1

            testObj.read(readId).then(result => {
                result.sql.should.equals(expectQuery.read)
                result.method.should.equals('first')
                result.bindings[0].should.equals(readId)
                result.bindings[1].should.equals(limit)
                done()
            }).catch(err => done(err))
        })
    })

// edit test that change tag value
    describe('#edit()' , () => {
        it('should return a valid query', (done) => {
            const editObject = {
                id: 1, 'tag': 'prosperity'
            }

            testObj.edit(editObject).then(result => {
                result.sql.should.equals(expectQuery.edit)
                result.method.should.equals('update')
                result.bindings[0].should.equals(editObject.id)
                result.bindings[1].should.equals(editObject.tag)
                result.bindings[2].should.to.exist
                result.bindings[3].should.equals(editObject.id)
                done()
            }).catch(err => done(err))
        })
    })

// add test which insert data to DB
    describe('#add()' , () => {
        it('should return a valid query', (done) => {
            const addTag = 'prosperity'

            testObj.add({'tag': addTag}).then(result => {
                result.sql.should.equals(expectQuery.add)
                result.method.should.equals('insert')
                result.bindings[0].should.to.exist
                result.bindings[1].should.equals(addTag)
                result.bindings[2].should.to.exist
                done()
            }).catch(err => done(err))
        })
    })

// delete test which fill updated_at
    describe('#delete()' , () => {
        it('should return a valid query for soft delete', (done) => {
            const deleteId = 12

            testObj.delete({'id': deleteId}).then(result => {
                result.sql.should.equals(expectQuery.del)
                result.method.should.equals('update')
                result.bindings[0].should.to.exist
                result.bindings[1].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })

// delete test which real delete data from DB
        it('should return a valid query for forced delete', (done) => {
            const deleteQuery = 'delete from `tags` where `id` = ?'
            const deleteId = 12

            testObj.delete({'id': deleteId}, true).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('del')
                result.bindings[0].should.equals(deleteId)
                done()
            }).catch(err => done(err))
        })
    })

//attach test
    describe('#attach()' , () => {
        it('should return a valid query', (done) => {
            const mockEntity = {id: 1, user_id: 9}
            const mockUser = {id: 9}
            const mockTags = [{id: 1, tag: 'cool'}]
            const mockType = 'person'

            testObj.attach(mockEntity, mockUser, mockTags, mockType).then(result => {
                result.sql.should.equals('insert into `taggables` (`tag_id`, `taggable_id`, `taggable_type`, `user_id`) values (?, ?, ?, ?)')
                result.method.should.equals('insert')
                result.bindings[0].should.equals(mockEntity.id)
                result.bindings[1].should.equals(mockTags[0].id)
                result.bindings[2].should.equals(mockType)
                result.bindings[3].should.equals(mockUser)         
                done()
            }).catch(err => done(err))
        })
    })

    

//detach test
    describe('#detach()' , () => {
        it('should return a valid query', (done) => {
            const mockEntity = {id: 1}
            const mockUser = {id: 9}
            const mockTags = [{id: 1, tag: 'cool'}]
            const mockType = 'person'

            testObj.detach(mockEntity, mockUser, mockTags, mockType).then(result => {
                result.sql.should.equals('delete from `taggables` where `tag_id` in (?) and `user_id` = ? and `taggable_id` = ? and `taggable_type` = ?')
                result.method.should.equals('del')
                result.bindings[0].should.equals(mockTags[0].id)
                result.bindings[1].should.equals(mockUser)         
                result.bindings[2].should.equals(mockEntity.id)
                result.bindings[3].should.equals(mockType)
                done()
            }).catch(err => done(err))
        })
    })

})

describe('TagService - getInstances()', () => {
   
    tracker.install()

    tracker.on('query', function checkResult(query) {
        query.response([ { id: 13,
            tag: 'horror',
            created_at: null,
            updated_at: null,
            deleted_at: null 
        },
        { 
            id: 14,
            tag: 'hansome',
            created_at: null,
            updated_at: null,
            deleted_at: null 
        } 
        ])
    })

    testObj.getInstances({tag: 'horror'}, {tag: 'hansome'}).then(function (model) {
            expect(model[0].id).to.equal(13)
            expect(model[0].tag).to.equal('horror')
            tracker.uninstall()
            done()
    })


})


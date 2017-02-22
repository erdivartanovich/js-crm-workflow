'use strict'

const Path = '../../../src/'
const NoteService = require(Path + 'Services/Note/NoteService')
const obj = new NoteService()
const tracker = mockDB.getTracker()


describe('NoteService', () => {
    before(() => {
        tracker.install()
        tracker.on('query', function checkResult(query) {
            query.response(query)
        })
    })

    after(() => {
        tracker.uninstall()
    })

    describe('#browse', () => {
        const query = 'select * from `notes` where `deleted_at` is null'
        it('Should return valid query results', () => {
            return obj.browse().then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('select')
                result.transacting.should.equals(false)
            }).catch(err => done(err))
        })
    })

    describe('#read', () => {
        const query = 'select * from `notes` where `deleted_at` is null and `id` = ? limit ?'
        const resultObj = {id: 35}
        it('Should return a valid query result', () => {
            return obj.read(resultObj.id).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('first')
                result.transacting.should.equals(false)
            })
        })
    })

    describe('#edit', () => {
        const query = 'update `notes` set `id` = ?, `updated_at` = ? where `id` = ?'
        const resultObj = {id: 32, updated_at: null}
        it('Could edit a column or row using update query', () => {
            return obj.edit(resultObj).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('update')
                result.bindings[0].should.equals(resultObj.id)
                result.bindings[1].should.equals(obj.getNow())
                result.bindings[2].should.equals(resultObj.id)
            })
        })
    })

    describe('#add', () => {
        const query = 'insert into `notes` (`created_at`, `id`, `updated_at`) values (?, ?, ?)'
        const resultObj = {id: 87}
        it('Could add a record to database table using insert query', () => {
            return obj.add(resultObj).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('insert')
                result.bindings[0].should.equals(obj.getNow())
                result.bindings[1].should.equals(resultObj.id)
                result.bindings[2].should.equals(obj.getNow())
            })
        })
    })

    describe('#delete', () => {
        const query = 'delete from `notes` where `id` = ?'
        const resultObj = {id: 21}
        it('Could delete a record from database table using delete query', () => {
            return obj.delete(resultObj, true).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('del')
                result.bindings[0].should.equals(resultObj.id)
            })
        })
    })

})

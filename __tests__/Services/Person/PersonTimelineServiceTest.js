'use strict'

const Path = '../../../src/'
const PersonTimelineService = require(Path + 'Services/Person/PersonTimelineService')

const tracker = mockDB.getTracker()

const obj = new PersonTimelineService()


describe('PersonTimelineService', () =>{
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
        it('Should return a valid query result', () => {
            const query = 'select * from `person_timelines` where `deleted_at` is null'
            return obj.browse().then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('select')
                result.transacting.should.equals(false)
            }).catch(err => done(err))
        })
    })

    describe('#read', () => {
        it('Should return a valid query result', () => {
            const query = 'select * from `person_timelines` where `deleted_at` is null and `id` = ? limit ?'
            const resultObj = {id: 32}
            return obj.read(resultObj).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('first')
                result.bindings[0].should.equals(resultObj)
                result.bindings[1].should.equals(1)
            }).catch(err => done(err))
        })
    })

    describe('#edit', () => {
        it('Could edit a column or row using update query', () => {
            const query = 'update `person_timelines` set `id` = ?, `updated_at` = ? where `id` = ?'
            const resultObj = {id: 45}
            return obj.edit(resultObj).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('update')
                result.bindings[0].should.equals(resultObj.id)
                result.bindings[1].should.not.empty
                result.bindings[2].should.equals(resultObj.id)
            }).catch(err => done(err))
        })
    })

    describe('#add', () => {
        it('Could insert a record to database table using insert query', () => {
            const query = 'insert into `person_timelines` (`created_at`, `id`, `updated_at`) values (?, ?, ?)'
            const resultObj = {id: 200, created_at: null ,updated_at: '2016-02-11 21:29:42'}
            return obj.add(resultObj).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('insert')
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(resultObj.id)
                result.bindings[2].should.equals(resultObj.updated_at)
            }).catch(err => done(err))
        })
    })

    describe('#delete', () => {
        it('Could delete a record from database table using delete query', () => {
            const query = 'delete from `person_timelines` where `id` = ?'
            const resultObj = {id: 97}
            return obj.delete(resultObj, true).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('del')
                result.bindings[0].should.equals(resultObj.id)
            })
        })
    })


})

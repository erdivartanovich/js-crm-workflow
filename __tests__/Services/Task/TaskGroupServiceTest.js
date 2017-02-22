'use strict'

const Path = '../../../src/'
const TaskGroupService = require(Path + 'Services/Task/TaskGroupService')

const tracker = mockDB.getTracker()

const obj = new TaskGroupService()


describe('TaskGroupService', () =>{
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
            const query = 'select * from `task_groups` where `deleted_at` is null'
            return obj.browse().then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('select')
                result.transacting.should.equals(false)
            })
        })
    })

    describe('#read', () => {
        it('Should return a valid query result', () => {
            const query = 'select * from `task_groups` where `deleted_at` is null and `id` = ? limit ?'
            const resultObj = {id: 32}
            return obj.read(resultObj).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('first')
                result.bindings[0].should.equals(resultObj)
                result.bindings[1].should.equals(1)
            })
        })
    })

    describe('#edit', () => {
        it('Could edit a column or row using update query', () => {
            const query = 'update `task_groups` set `id` = ?, `updated_at` = ? where `id` = ?'
            const resultObj = {id: 45}
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
        it('Could insert a record to database table using insert query', () => {
            const query = 'insert into `task_groups` (`created_at`, `id`, `updated_at`) values (?, ?, ?)'
            const resultObj = {id: 200, created_at: null ,updated_at: '2016-02-11 21:29:42'}
            return obj.add(resultObj).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('insert')
                result.bindings[0].should.equals(obj.getNow())
                result.bindings[1].should.equals(resultObj.id)
                result.bindings[2].should.equals(resultObj.updated_at)
            })
        })
    })

    describe('#delete', () => {
        it('Could delete a record from database table using delete query', () => {
            const query = 'delete from `task_groups` where `id` = ?'
            const resultObj = {id: 97}
            return obj.delete(resultObj, true).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('del')
                result.bindings[0].should.equals(resultObj.id)
            })
        })
    })


})

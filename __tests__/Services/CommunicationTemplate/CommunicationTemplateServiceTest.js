'use strict'

const Path = '../../../src/'
const CommunicationTemplateService = require(Path + 'Services/CommunicationTemplate/CommunicationTemplateService')

const obj = new CommunicationTemplateService()
const tracker = mockDB.getTracker()

describe('0o0======|- CommunicationTemplateService -|======0o0', () => {

    before(() => {
        // mockDB.mock(db)
        tracker.install()
        tracker.on('query', function checkResult(query) {
        query.response(query)

        })
    })

    after(() => {
        // mockDB.unmock(db)
        tracker.uninstall()
    })

    describe('#browse', () => {
        const query = 'select * from `communication_templates` where `deleted_at` is null'
        it('Should return valid query results', () => {
            return obj.browse().then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('select')
                result.transacting.should.equals(false)
            })
        })
    })

    describe('#read', () => {
        it('Should return a valid query result', () => {
            const query = 'select * from `communication_templates` where `deleted_at` is null and `id` = ? limit ?'
            return obj.read(2).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('first')
                result.bindings[0].should.equals(2)
                result.bindings[1].should.equals(1)
            })
        })
    })

    describe('#edit', () => {
        it('Could edit a column or row using update query', () => {
            const query = 'update `communication_templates` set `id` = ?, `updated_at` = ? where `id` = ?'
            return obj.edit({id: 2}).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('update')
                result.bindings[0].should.equals(2)
                result.bindings[1].should.not.empty
                result.bindings[2].should.equals(2)
            })
        })
    })

    describe('#add', () => {
        it('Could add a record to database table using insert query', () => {
            const query ='insert into `communication_templates` (`created_at`, `id`, `updated_at`) values (?, ?, ?)'
            return obj.add({id: 1}).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('insert')
                result.bindings[0].should.not.empty
                result.bindings[1].should.equals(1)
                result.bindings[2].should.not.empty
            })
        })
    })

    describe('#delete', () => {
        it('Could delete a record from database table using delete query', () => {
            const query = 'delete from `communication_templates` where `id` = ?'
            return obj.delete({id: 2}, true).then((result) => {
                result.sql.should.equals(query)
                result.method.should.equals('del')
                result.bindings[0].should.equals(2)
            })
        })
    })

})

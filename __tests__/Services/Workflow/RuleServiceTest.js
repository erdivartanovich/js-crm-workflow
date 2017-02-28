'use strict'

const sourcePath = '../../../src'
const RuleService = require(sourcePath + '/Services/Workflow/RuleService')
var tracker = require('mock-knex').getTracker()

const testObj = new RuleService()

describe('RuleService', () => {


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
            const browseQuery = 'select * from `rules` where `deleted_at` is null'

            testObj.browse().then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')

                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()' , () => {
        it('should return a valid query', (done) => {
            const readQuery = 'select * from `rules` where `deleted_at` is null and `id` = ? limit ?'
            const readId = {id: 7}
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
            const editQuery = 'update `rules` set `action_id` = ?, `id` = ?, `updated_at` = ? where `id` = ?'
            const editObject = {
                id: 1, 'action_id': 77,
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

    describe('#delete()' , () => {
      it('should return a valid query for forced delete', (done) => {
          const deleteQuery = 'delete from `rules` where `id` = ?'
          const deleteId = 12

          testObj.delete({'id': deleteId}, true).then(result => {
              result.sql.should.equals(deleteQuery)
              result.method.should.equals('del')
              result.bindings[0].should.equals(deleteId)

              done()
          }).catch(err => done(err))
      })
    })

    describe('#syncActions()', () => {
        it('should return valid query for syncActions', (done) => {
            const rule = {
                id: 1
            }
            const action = [
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

            const deleteQuery = 'insert into `rule_action` (`id`, `rule_id`) values (?, ?), (?, ?), (?, ?)'
            testObj.syncActions(rule, action).then(result => {
                result.sql.should.equals(deleteQuery)
                result.method.should.equals('insert')
                result.bindings[1].should.equals(rule.id)
                result.bindings[0].should.equals(action[0].id)
                result.bindings[3].should.equals(rule.id)
                result.bindings[2].should.equals(action[1].id)
                result.bindings[5].should.equals(rule.id)
                result.bindings[4].should.equals(action[2].id)

                done()
            }).catch(err => done(err))
        })
    })
})

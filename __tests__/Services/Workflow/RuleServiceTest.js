'use strict'

const sourcePath = '../../../src'
const RuleService = require(sourcePath + '/Services/Workflow/RuleService')
var tracker = require('mock-knex').getTracker()

const testObj = new RuleService()

describe('RuleService', () => {


    before(() => {
        tracker.install()
        tracker.on('query', function checkResult(query, step) {
            switch (step) {
                case 9:
                    query.response([{
                        rule_id: 10,
                    }, {
                        rule_id: 11,
                    }])
                    break
                default:
                    query.response(query)
            }
        })

    })

    after(() => {
        tracker.uninstall()
    })

    describe('#browse()', () => {
        it('should return a valid query', (done) => {
            const browseQuery = 'select * from `rules` where `deleted_at` is null'

            testObj.browse().then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')

                done()
            }).catch(err => done(err))
        })
    })

    describe('#read()', () => {
        it('should return a valid query', (done) => {
            const readQuery = 'select * from `rules` where `deleted_at` is null and `id` = ? limit ?'
            const readId = { id: 7 }
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

    describe('#edit()', () => {
        it('should return a valid query', (done) => {
            const editQuery = 'update `rules` set `action_id` = ?, `id` = ?, `updated_at` = ? where `id` = ?'
            const editObject = {
                id: 1,
                'action_id': 77,
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

    describe('#delete()', () => {
        it('should return a valid query for forced delete', (done) => {
            const deleteQuery = 'delete from `rules` where `id` = ?'
            const deleteId = 12

            testObj.delete({ 'id': deleteId }, true).then(result => {
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
            const action = [{
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

    describe('#getRuleThatHasAction()', () => {
        it('Should return valid query for getRuleThatHasAction', (done) => {
            const workflow = {
                id: 1
            }
            const action = {
                id: 2
            }

            const addQuery = 'select * from `rules` where `workflow_id` = ? and `id` in (?, ?)'
            testObj.getRuleThatHasAction(workflow, action).then(result => {
                result.sql.should.equals(addQuery)

                done()
            }).catch(err => done(err))
        })
    })

    describe('#getParent()', () => {
        it('Should return valid query', (done) => {
            const query = 'select * from `rules` where `deleted_at` is null and `id` = ? limit ?'
            testObj.getParent({
                id: 1,
                parent_id: 1,
                workflow_id: 1
            }).then(result => {
                result.sql.should.equals(query)

                done()
            }).catch(err => done(err))
        })

        it('Should return null', (done) => {

            testObj.getParent({
                id: 1,
                parent_id: null,
                workflow_id: 1
            }).then(result => {
                if (result !== null) {
                    throw new Error('It returns something else than null')
                } else {
                    done()
                }
            }).catch(err => done(err))
        })
    })

    describe('#getParentsFor()', () => {
        it('Should return an empty array', (done) => {
            let rule = {
                id: 3,
                parent_id: null
            }

            testObj.getParentsFor(rule).then(result => {
                if (result.length !== 0) {
                    throw Error('Return value is not an empty array')
                }
                done()
            }).catch(err => done(err))
        })
    })


    describe('#getRuleWithParent()', () => {
        it('Should return valid query', (done) => {
            const query = 'select * from `rules` where `workflow_id` = ? and `parent_id` is not null'
            const workflow = { id: 2 }

            testObj.getRuleWithParent(workflow)
                .then(result => {
                    result.sql.should.equals(query)
                    result.bindings[0].should.equals(workflow.id)

                    done()
                }).catch(err => done(err))
        })
    })

    describe('#getAssociatedRule()', () => {
        it('Should return valid query', (done) => {
            const query = 'select * from `rule_action` where `rule_id` in (?, ?, ?) and `action_id` = ?'
            const action = { id: 2 }
            const ids = [1, 2, 3]

            testObj.getAssociatedRule(action, ids)
                .then(result => {
                    result.sql.should.equals(query)
                    result.bindings[0].should.equals(ids[0])
                    result.bindings[1].should.equals(ids[1])
                    result.bindings[2].should.equals(ids[2])
                    result.bindings[3].should.equals(action.id)

                    done()
                }).catch(err => done(err))
        })
    })

    describe('#getRuleObjects()', () => {
        it('Should return valid query', (done) => {
            const query = 'select * from `rules` where `id` in (?, ?, ?)'
            const rules = [1, 3, 5]

            testObj.getRuleObjects(rules)
                .then(result => {
                    result.sql.should.equals(query)
                    result.bindings[0].should.equals(rules[0])
                    result.bindings[1].should.equals(rules[1])
                    result.bindings[2].should.equals(rules[2])

                    done()
                }).catch(err => done(err))
        })
    })
})
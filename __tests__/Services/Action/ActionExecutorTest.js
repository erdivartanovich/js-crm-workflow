'use strict'

const sourcePath = '../../../src'
const ActionExecutor = require(sourcePath + '/Services/Action/ActionExecutor')
var tracker = require('mock-knex').getTracker()

const workflow = {
    id: 1
}

const action = {
    id: 9
}

const objects = {

}

const rules = {

}

const testObj = new ActionExecutor(workflow, action, objects, rules)

describe('ActionExecutor', () => {

    before(() => {

        tracker.install()
        tracker.on('query', function checkResult(query) {
            query.response(query)
        })

    })

    after(() => {
        tracker.uninstall()
    })

    describe('#filterRules()' , () => {
        it('should return a valid query', (done) => {
            const browseQuery = 'select * from `rules` inner join `rule_action` on (`rule_action`.`rule_id` = `rules`.`id` and `rule_action`.`rule_id` = 3) where `rules`.`workflow_id` = ?'

            testObj.filterRules().then(result => {
                result.sql.should.equals(browseQuery)
                result.method.should.equals('select')
                result.bindings[0].should.equals(testObj.workflow.id)

                done()
            }).catch(err => done(err))
        })
    })


})

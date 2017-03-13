const basePath = '../../../src'
var tracker = require('mock-knex').getTracker()
const di = require(basePath + '/di')

const Tagger = di.container['Tagger']
const testObj = Tagger

describe('===== Tagger Action test =====', () => {

    before(() => {
        tracker.install()

        tracker.on('query', function checkResult(query) {
            query.response(query)
        })
        
    })

    after(() => {
        tracker.uninstall()
    })

//attach test
    describe('=== When calling Tagger.attach ===', () => {
        before(() => {
            tracker.on('query', function sendResult(query, step) {
                switch(step) {
                case 3:
                    query.response([{
                        id: 1
                    }])
                    break
                default:
                    query.response(query)
                }
            })
        })
    
        it('should return valid query', () => {
            const workflow = {id: 1, user_id: 9}
            const person = {id: 1}
            const tag = 'hazardous'
            const action = ''
            return testObj.attach(workflow, action, person, tag)
                .then((res) => {
                    res.sql.should.equals('insert into `taggables` (`tag_id`, `taggable_id`, `taggable_type`, `user_id`) values (?, ?, ?, ?)')
                    res.bindings[2].should.equals[type]
                    res.bindings[3].should.equals[workflow.user_id]
                    res.method.should.equals('insert')
                })
        })
    })

//detach test
    describe('=== When calling Tagger.detach ===', () => {
        before(() => {
            tracker.on('query', function sendResult(query, step) {
                switch(step) {
                case 3,7:
                    query.response([{
                        id: 1
                    }])
                    break
                default:
                    query.response(query)
                }
            })
        })
    
        it('should return valid query', () => {
            const workflow = {id: 1, user_id: 9}
            const person = {id: 1}
            const tag = 'hazardous'
            const action = ''
            return testObj.attach(workflow, action, person, tag)
                .then((res) => {
                    res.sql.should.equals('insert into `taggables` (`tag_id`, `taggable_id`, `taggable_type`, `user_id`) values (?, ?, ?, ?)')
                    res.bindings[2].should.equals[type]
                    res.bindings[3].should.equals[workflow.user_id]
                    res.method.should.equals('insert')
                })
        })
    })

})

const basePath = '../../../src'
var tracker = require('mock-knex').getTracker()
const di = require(basePath + '/di')

const SocialAppend = di.container['SocialAppend']
const testObj = SocialAppend

describe('===== SocialAppend Action test =====', () => {

    before(() => {
        tracker.install()

        tracker.on('query', function checkResult(query) {
            query.response(query)
        })
        
    })

    after(() => {
        tracker.uninstall()
    })

//crawlPerson Test
    describe('=== crawlPerson ===', () => {
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
            const person = {id: 1, user_id: 9, stage_id: 5, lead_type_id: 4}
            return Promise.resolve(testObj.crawlPerson(person))
                .then((res) => { 
                    res.should.be.equals(true)  
                })
        })
    })
})
const basePath = '../../../src'
const PersonContactTypeService = require(basePath + '/Services/Person/PersonContactTypeService')
var tracker = require('mock-knex').getTracker()

const testObj = new PersonContactTypeService()

const expectedResults = [
    {
        id : 3,
        person_id : 10,
        deleted_at: null,
    },
    {
        id : 2,
        deleted_at: null,
        person_id : 10,
    },
    {
        id : 1,
        deleted_at: null,
        person_id : 15,
    },
]

describe('PersonContactTypeService', () => {

    beforeEach(() => {
        tracker.install()

        tracker.on('query', function checkResult(query) {
            query.response(expectedResults)
        })
    })

    afterEach(() => {
        tracker.uninstall()
    })

    describe('#browse()', () => {
        it('should return valid results', () => {
            return testObj.browse().should.eventually.equals(expectedResults)
        })
    })

    describe('#read()', () => {
        it('should return a valid result', () => {
            return testObj.read(1).should.eventually.equals(expectedResults[2])
        })
    })
})

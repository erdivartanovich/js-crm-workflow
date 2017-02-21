const Path = '../../../src/'
const LeadTypeService = require(Path + 'Services/Person/LeadTypeService')
const knex = require(Path + 'connection')
const mockDB = require('mock-knex')


var chai = require('chai')
var should = chai.should()
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised)


const db = knex({
    client: 'mysql'
})

const tracker = mockDB.getTracker()

tracker.install()

before(() => {
    mockDB.mock(db)
})

after(() => {
    mockDB.unmock(db)
})

const obj = new LeadTypeService()

tracker.on('query', function checkResult(query) {
  query.response([
    {
      fielda : 'A',
      fieldb : 'B'
    },
    {
      fielda : 'C',
      fieldb : 'D'
    },
    {
      fielda : 'E',
      fieldb : 'F'
    }
  ])
})

describe('LeadTypeService', function() {
    describe('Browse', function() {
        it('Should return valid query result', function(done) {
            return obj.browse().should.eventually.equal({field: 'A'})
        })
    })
})

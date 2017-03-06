'use strict'

const sourcePath = '../../../src'
const PersonService = require(sourcePath + '/Services/Person/PersonService')
const ResourceFinder = require(sourcePath + '/Services/Action/ResourceFinder')
const RuleCriteriaFactory = require(sourcePath + '/Infrastructures/Rule/RuleCriteriaFactory')
const ObjectCriteriaFactory = require(sourcePath + '/Infrastructures/Workflow/ObjectCriteriaFactory')
var tracker = require('mock-knex').getTracker()

const td = require('testdouble')

const mocks = {}

let testObject

describe('ResourceFinder' , () => {
    before(() => {
        tracker.install()

        const rules = [], objects = []
        mocks.personService = td.object(PersonService)
        mocks.rule = new RuleCriteriaFactory(rules)
        mocks.object = new ObjectCriteriaFactory(objects)
        const persons = [
            { id: 1 },
            { id: 2 },
        ]

        td.when(mocks.personService.get()).thenReturn(Promise.resolve(persons))
        td.when(mocks.personService.resetConditions()).thenReturn(mocks.personService)
        td.when(mocks.personService.applyCriteria(mocks.rule)).thenReturn(mocks.personService)
        td.when(mocks.personService.applyCriteria(mocks.object)).thenReturn(mocks.personService)
        td.when(mocks.personService.browse()).thenReturn(Promise.resolve(persons))

        testObject = new ResourceFinder({}, {}, mocks.personService, objects, rules)
    })

    after(() => {
        tracker.uninstall()        
    })

<<<<<<< HEAD
=======
    // describe('#get()', () => {
    //     it('should return a resultset containing entities', (done) => {
    //         testObject.get().then(results => {
    //             results.should.be.an('array')
    //             done()
    //         }).catch(err => done(err))
    //     })
    // })

>>>>>>> develop
    describe('#setUserContext()', () => {
        it('should return itself', () => {
            testObject.setUserContext({}).should.equals(testObject)
        })
    })

    describe('#runnableOnce()', () => {
        it('should set runOnce into true', () => {
            testObject.runnableOnce()
            testObject.runOnce.should.equals(true)
        })

        it('should set runOnce into false', () => {
            testObject.runnableOnce(false)
            testObject.runOnce.should.equals(false)
        })

        it('should return itself', () => {
            testObject.runnableOnce(false).should.equals(testObject)
        })
    })

    describe('#prepareCriteria()', () => {
        it('should set limit into 10', () => {
            testObject.prepareCriteria(10)
            testObject.limit.should.equals(10)
        })

        it('should set limit into 100', () => {
            testObject.prepareCriteria()
            testObject.limit.should.equals(100)
        })

        it('should return itself', () => {
            testObject.prepareCriteria().should.equals(testObject)
        })
    })
})

    // describe('#getBatches()', () => {
    //     it('should have 1 batch', (done) => {
    //         testObject.getBatches().then(results => {
    //             results.length.should.equals(1)
    //             done()
    //         }).catch(err => done(err))
    //     })

    //     it('should have 2 batches', (done) => {
    //         testObject.prepareCriteria(1).getBatches().then(results => {
    //             results.length.should.equals(2)
    //             done()
    //         }).catch(err => done(err))
    //     })
    // })

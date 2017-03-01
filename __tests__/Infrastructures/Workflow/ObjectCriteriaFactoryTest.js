'use strict'

const basePath = '../../../src'
const ObjectCriteriaFactory = require(basePath + '/Infrastructures/Workflow/ObjectCriteriaFactory')
const PersonService = require(basePath + '/Services/Person/PersonService')
let objectCriteriaFactory

const should = require('chai').should()

const td = require('testdouble')

describe('ObjectCriteriaFactory', () => {
    before(() =>  {
        objectCriteriaFactory = new ObjectCriteriaFactory
    })

    describe('#getHavingMap()', () => {
        it('should return an object', () => {
            objectCriteriaFactory.getHavingMap().should.be.an('object')
        })
    })

    describe('#mapHaving()', () => {
        it('should return an object', () => {
            objectCriteriaFactory.mapHaving('tags').should.be.an('array')
        })

        it('should not exist', () => {
            should.not.exist(objectCriteriaFactory.mapHaving('random-text'))
        })
    })

    describe('#apply()', () => {
        it('should return an object', () => {
            const personService = td.object(PersonService)
            td.when(personService.getRelationLists()).thenReturn([])

            const objects = [
                {
                    object_class: 'tags.tag_id',
                    operator: 1,
                    object_type: '5',
                }
            ]

            objectCriteriaFactory = new ObjectCriteriaFactory(objects)

            const appliedService = objectCriteriaFactory.apply(personService)

            appliedService.should.be.an('object')
        })
    })
})

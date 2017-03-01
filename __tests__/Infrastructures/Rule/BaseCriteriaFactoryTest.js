'use strict'

const td = require('testdouble')
const basePath = '../../../src'
const PersonService = require(basePath + '/Services/Person/PersonService')
const BaseCriteriaFactory = require(basePath + '/Infrastructures/Rule/BaseCriteriaFactory')
const Filter = require(basePath + '/Infrastructures/Adapter/Filter')
let baseCriteriaFactory

describe('BaseCriteriaFactory', () => {
    before(() =>  {
        baseCriteriaFactory = new BaseCriteriaFactory
    })

    describe('#setJoin()', () => {
        it('should be chainable', () => {
            let model = td.object(PersonService)
            let table = 'person_addresses'
            let relation = {'persons.id': 'person_addresses.person_id'}
            td.when(model.join(table, relation, '')).thenReturn(model)
            const retVal = baseCriteriaFactory.setJoin(model, table, relation)

            retVal.should.be.an('object')
        })
    })

    describe('#toFilter()', () => {
        it('should be chainable', () => {
            const condition = {
                operator: 'is',
                value: '5',
                field_name: 'persons.date_of_birth',
            }
            
            baseCriteriaFactory.toFilter(condition).should.be.an.instanceOf(Filter)
        })
    })

    describe('#setColumnName()', () => {
        it('should set attribute properly', () => {
            baseCriteriaFactory.setColumnName('test')

            baseCriteriaFactory.columnName.should.equals('test')
        })
    })

    describe('#getResourceName()', () => {
        it('should return resource name', () => {
            baseCriteriaFactory.getResourceName('persons.date_of_birth').should.equals('persons')
        })
    })
    describe('#substrReplace()', () => {
        it('should have a valid return value', () => {
            const testString = 'persons.date_of_birth'
            baseCriteriaFactory.substrReplace(testString, '', testString.indexOf('.'), testString.length)
                .should.equals('persons')

            baseCriteriaFactory.substrReplace(testString, '', 0, testString.length)
                .should.equals('')
        })
    })
    
})

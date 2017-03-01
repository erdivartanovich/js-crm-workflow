'use strict'

const td = require('testdouble')
const basePath = '../../../src'
const Filter = require(basePath + '/Infrastructures/Adapter/Filter')

let filter

describe('Infrastructures/Adapter/Filter', () => {

    before(() => {
        const condition = {
            operator: 'is',
            value: '5',
            field_name: 'persons.date_of_birth',
        }

        filter = new Filter(condition.field_name, condition.value, condition.operator)
    }) 

    describe('#getOperatorMutatorMap()', () => {
        it('should return mutator map', () => {
            filter.getOperatorMutatorMap().should.be.an.object
        })
    })

    describe('#getColumnName()', () => {
        it('should return a valid value', () => {
            filter.getColumnName().should.equals('persons.date_of_birth')
        })
    })

    describe('#getOperator()', () => {
        it('should return a valid value', () => {
            filter.getOperator().should.equals('=')
        })
    })

    describe('#getValue()', () => {
        it('should return a valid value', () => {
            filter.getValue().should.equals('5')
        })
    })

    describe('#isValid()', () => {
        it('should return a valid value', () => {
            filter.isValid().should.equals(true)
        })
    })
})

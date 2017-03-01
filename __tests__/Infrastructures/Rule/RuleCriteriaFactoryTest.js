'use strict'

const basePath = '../../../src'
const RuleCriteriaFactory = require(basePath + '/Infrastructures/Rule/RuleCriteriaFactory')
const PersonService = require(basePath + '/Services/Person/PersonService')
let ruleCriteriaFactory

const td = require('testdouble')

describe('RuleCriteriaFactory', () => {
    before(() =>  {
        ruleCriteriaFactory = new RuleCriteriaFactory
    })

    describe('#toCondition()', () => {
        it('should return a valid converted object if field type is 6', () => {

            const rule = {
                field_name: 'persons.date_of_birth',
                operator: 1,
                value: '5',
                field_type: 6,
            }

            const condition = ruleCriteriaFactory.toCondition(rule)

            condition.field_name.should.equals(`MONTH(${rule.field_name})`)
            condition.operator.should.equals('is')
            condition.value.should.equals(rule.value)
        })

        it('should return a valid converted object', () => {
            const rule = {
                field_name: 'persons.date_of_birth',
                operator: 1,
                value: '5',
                field_type: 3,
            }

            const condition = ruleCriteriaFactory.toCondition(rule)

            condition.field_name.should.equals(rule.field_name)
            condition.operator.should.equals('is')
            condition.value.should.equals(rule.value)
        })
    })

    describe('#mutateOperator', () => {
        it('should return \'is\'', () => ruleCriteriaFactory.mutateOperator({operator: 1}).should.equals('is'))
        it('should return \'!is\'', () => ruleCriteriaFactory.mutateOperator({operator: 2}).should.equals('!is'))
        it('should return \'gte\'', () => ruleCriteriaFactory.mutateOperator({operator: 3}).should.equals('gte'))
        it('should return \'gt\'', () => ruleCriteriaFactory.mutateOperator({operator: 4}).should.equals('gt'))
        it('should return \'lte\'', () => ruleCriteriaFactory.mutateOperator({operator: 5}).should.equals('lte'))
        it('should return \'lt\'', () => ruleCriteriaFactory.mutateOperator({operator: 6}).should.equals('lt'))
        it('should return \'between\'', () => ruleCriteriaFactory.mutateOperator({operator: 7}).should.equals('between'))
        it('should return \'!between\'', () => ruleCriteriaFactory.mutateOperator({operator: 8}).should.equals('!between'))
        it('should return \'in\'', () => ruleCriteriaFactory.mutateOperator({operator: 9}).should.equals('in'))
        it('should return \'!in\'', () => ruleCriteriaFactory.mutateOperator({operator: 10}).should.equals('!in'))
    })

    describe('#apply', () => {
        it ('', () => {
            const personService = td.object(PersonService)
            const rules = [
                {
                    field_name: 'persons.date_of_birth',
                    operator: 1,
                    value: '5',
                    field_type: 3,
                }
            ]

            ruleCriteriaFactory = new RuleCriteriaFactory(rules)

            const appliedService = ruleCriteriaFactory.apply(personService)

            appliedService.should.be.an.object
        })
    })
})

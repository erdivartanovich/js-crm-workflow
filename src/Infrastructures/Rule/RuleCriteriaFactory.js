'use strict'

const BaseCriteriaFactory = require('./BaseCriteriaFactory')

const FIELD_TYPE_BOOLEAN = 1
const FIELD_TYPE_CURRENCY = 2
const FIELD_TYPE_DATE = 3
const FIELD_TYPE_NUMBER = 4
const FIELD_TYPE_PERCENT = 5
const FIELD_TYPE_MONTH = 6

const OPERATOR_EQUAL = 1 // =
const OPERATOR_NOT_EQUAL = 2 // <> | !=
const OPERATOR_GREATER_THAN_OR_EQUAL = 3 // >=
const OPERATOR_GREATER_THAN = 4 // >
const OPERATOR_LESS_THAN_OR_EQUAL = 5 // <=
const OPERATOR_LESS_THAN = 6 // <
const OPERATOR_BETWEEN = 7 // between
const OPERATOR_NOT_BETWEEN = 8 // not between
const OPERATOR_IN = 9 // in()
const OPERATOR_NOT_IN = 10 //not_in

const _ = require('lodash')

class RuleCriteriaFactory extends BaseCriteriaFactory {

    constructor(rules) {
        super()
        this.rules = rules
    }

    toCondition(rule) {
        let fieldName = rule.field_name
        if (rule.field_type == FIELD_TYPE_MONTH) {
            fieldName = 'MONTH(' + fieldName + ')'
        }

        return {
            field_name: fieldName,
            value: rule.value,
            operator: this.mutateOperator(rule),
        }
    }

    mutateOperator(rule)
    {
        switch (rule.operator) {
        case OPERATOR_EQUAL:
            return 'is'
        case OPERATOR_NOT_EQUAL:
            return '!is'
        case OPERATOR_GREATER_THAN_OR_EQUAL:
            return 'gte'
        case OPERATOR_GREATER_THAN:
            return 'gt'
        case OPERATOR_LESS_THAN_OR_EQUAL:
            return 'lte'
        case OPERATOR_LESS_THAN:
            return 'lt'
        case OPERATOR_BETWEEN:
            return 'between'
        case OPERATOR_NOT_BETWEEN:
            return '!between'
        case OPERATOR_IN:
            return 'in'
        case OPERATOR_NOT_IN:
            return '!in'
        }
    }

    apply(model) {

        const relations = {}
        const relationMaps = model.getRelationLists()

        this.rules.map(rule => {
            const filter = this.toFilter(this.toCondition(rule))

            model.where(filter.getColumnName(), filter.getOperator(), filter.getValue())
            const resourceName = this.getResourceName(filter.getColumnName())

            if (_.has(relationMaps, resourceName)) {
                relations[resourceName] = relationMaps[resourceName]
            }
        })

        _.map(relations, (relation, resourceName) => {
            model = this.setJoin(model, resourceName, relation)
        })

        return model
    }
}

module.exports = RuleCriteriaFactory

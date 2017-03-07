'use strict'

const _ = require('lodash')

class Filter {

    constructor(columnName, value, operator) {
        if (typeof operator == 'undefined') {
            operator = 'is'
        }

        this.columnName = columnName
        this.value = value
        this.operator = operator
        this.isDone = false
    }

    getOperatorMutatorMap() {
        return {
            'like': 'like',
            '!like': 'not like',
            'is': this.value === 'null' ? 'is' : '=',
            '!is': this.value === 'null' ? 'is not' : '!=',
            'between': 'between',
            '!between': 'not between',
            'gt': '>',
            'gte': '>=',
            'lt': '<',
            'lte': '<=',
            'in': 'in',
            '!in': 'not in',
        }
    }

    getColumnName() {
        return this.columnName
    }

    getOperator() {
        const map = this.getOperatorMutatorMap()

        if (this.isValid()) {
            return map[this.operator]
        }

        return 'like'
    }

    getValue() {
        return this.value
    }

    isValid() {
        return _.indexOf(_.keys(this.getOperatorMutatorMap()), this.operator) >= 0
    }

    isDone() {
        return this.isDone
    }

    done() {
        this.isDone = true
    }
}

module.exports = Filter

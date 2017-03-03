'use strict'

const Filter = require('../Adapter/Filter')

class BaseCriteriaFactory {

    setJoin(model, table, relation, type) {
        if (typeof type == 'undefined') {
            type = ''
        }

        return model.join(table, relation, type)
    }

    toFilter(condition) {
        return new Filter(condition.field_name, condition.value, condition.operator)
    }

    setColumnName(name) {
        this.columnName = name
    }

    getResourceName(columnName) {
        return this.substrReplace(columnName, '', columnName.indexOf('.'), columnName.length)
    }

    substrReplace(str, replace, start, length) {
        if (start < 0) {
            start = start + str.length + 1
        }

        length = length !== undefined ? length : str.length

        if (length < 0) {
            length = length + str.length - start
        }

        return [
            str.slice(0, start),
            replace.substr(0, length),
            replace.slice(length),
            str.slice(start + length)
        ].join('')
    }
}

module.exports = BaseCriteriaFactory

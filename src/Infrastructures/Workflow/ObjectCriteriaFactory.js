'use strict'

const BaseCriteriaFactory = require('./../Rule/BaseCriteriaFactory')
const _ = require('lodash')

class ObjectCriteriaFactory extends BaseCriteriaFactory {

    constructor(objects) {
        super()
        this.objects = objects
        this.relations = []
        this.sorts = []
        this.filters = []
    }

    /**
     * Refactor needed!
     */
    getHavingMap() {
        return {
            'tags': ['tag_id', 'taggables', 'taggable']
        }
    }

    mapHaving(resourceName) {
        const havingMap = this.getHavingMap()

        return havingMap[resourceName]
    }

    apply(model) {
        const relations = {}
        const relationMaps = model.getRelationLists()
        const having = {}
        
        this.objects.map(object => {
            const filter = this.toFilter(this.toCondition(object))

            const resourceName = this.getResourceName(filter.getColumnName())

            if (relationMaps[resourceName]) {
                relations[resourceName] = relationMaps[resourceName]
                model.where(filter.getColumnName(), filter.getOperator(), filter.getValue())
            } else {
                if (having[resourceName]) {
                    having[resourceName][filter.getColumnName()] = filter.getValue()
                } else {
                    having[resourceName] = {}
                    having[resourceName][filter.getColumnName()] = filter.getValue()
                }
            }
        })

        _.map(relations, (relation, resourceName) => {
            this.setJoin(model, resourceName, relation, 'left outer')
        })

        _.map(having, (have, resourceName) => {
            const map = this.mapHaving(resourceName)
            model.having(resourceName, have, map)
        })

        return model
    }

    toCondition(object) {
        return {
            field_name: object.object_class,
            value: object.object_type,
            operator: 'is',
        }
    }
}

module.exports = ObjectCriteriaFactory

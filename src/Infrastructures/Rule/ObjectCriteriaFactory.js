'use strict'

const BaseCriteriaFactory = require('./BaseCriteriaFactory')
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

    apply(model)
    {
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

const PersonService = require('../../Services/Person/PersonService')

const obj = new ObjectCriteriaFactory([
    {
        object_class: 'tags.id',
        object_type: 10
    },
])

const model = new PersonService

model.getRelationLists = () => {
    return {
        'person_addresses': {'persons.id': 'person_addresses.person_id'},
        'person_contact_types': {'persons.id': 'person_contact_types.person_id'},
        'person_contexts': {'persons.id': 'person_contexts.person_id'},
        'person_emails': {'persons.id': 'person_emails.person_id'},
        'person_family': {'persons.id': 'person_family.person_id'},
        'person_identifiers': {'persons.id': 'person_identifiers.person_id'},
        'person_motivations': {'persons.id': 'person_motivations.person_id'},
        'person_phones': {'persons.id': 'person_phones.person_id'},
        'person_preferences': {'persons.id': 'person_preferences.person_id'},
        'person_professions': {'persons.id': 'person_professions.person_id'},
        'person_scores': {'persons.id': 'person_scores.person_id'},
        'person_social_accounts': {'persons.id': 'person_social_accounts.person_id'},
    }
}

obj.apply(model)

model.browse().then(rows => {console.log(rows)})

const _ = require('lodash')

class PersonContactTypeService
{
    constructor(personContactTypeRepository) {
        this.repository = personContactTypeRepository
    }

    create(contactType) {
        this.repository.create(contactType)
    }

    update(contactType) {
        this.repository.update(contactType)
    }

    delete(contactType) {
        this.repository.delete(contactType)
    }

    sync(person, ...contactTypes) {
        const compareKey = ['getContactType.getKey']

        const toSync = _.map(contactTypes, contactType => {
            return new PersonContactTypeEntity().setPerson(person).setContactType(contactType)
        })

        const currents = this.repository.getFor(person)

        const toDelete = currents.filterNotExistIn(toSync, compareKey)
        const noChange = currents.filterNotExistIn(toDelete, ['getKey'])
        const toAdd = toSync.filterNotExistIn(noChange, compareKey)

        const result = {
            deleted: 0,
            added: 0,
        }

        if (toDelete.length > 0) {
            let ids = _.reduce(toDelete, (carry, personContactType) => {
                 carry.push(personContactType.getKey())
                 return carry
            }, [])

            let deleted = this.deleteMultiple(ids)
            result.deleted = deleted.delete_count
        }

        _.map(toAdd, instance => {
            this.create(instance)
        })

        $result.added = $toAdd.count()

        return $result
    }
}

module.exports = PersonContactTypeService

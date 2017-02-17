const _ = require('lodash')

class PersonContactTypeRepository extends RepositoryAbstract
{
    constructor(persistenceStorage) {
        super(persistenceStorage)
    }

    setupPayload(personContactType) {
        return {
            person_id: personContactType.getPerson().getKey(),
            contact_type_id: personContactType.getPerson().getKey(),
        }
    }

    create(personContactType) {
        const data = this.setupPayload(personContactType)

        return this.persistenceStorage.create(data)
    }

    update(personContactType) {
        const data = this.setupPayload(personContactType)

        return this.persistenceStorage.update(data, personContactType.getKey())
    }

    delete(personContactType) {
        return this.persistenceStorage.delete(personContactType.getKey())
    }

    getFor(person) {
        return this.persistenceStorage.where([
            'person_id' => $person.getKey(),
        ]).get()
    }
}

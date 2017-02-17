class PersonContactTypeEntity {

    constructor() {
        this.attributes = {
            person: null,
            personId: null,
            contactType: null,
        }
    }

    setPerson(PersonInterface $value) {
    }

    getPerson() {
        return {
            getKey: () => this.attributes.personId
        }
    }

    setContactType(ContactTypeInterface $value) {
    }

    getContactType() {
        return this.attributes.contactType
    }
}

module.exports = PersonContactTypeEntity

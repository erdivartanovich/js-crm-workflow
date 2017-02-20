const PersonFamilyService = require('./Services/Person/person-family-service')
const PersonIdentifierService = require('./Services/Person/person-identifier-service')

const familyService = new PersonFamilyService

familyService.read(1)
    .then((result) => result) 

familyService.edit({id: 1, person_id: 66, related_to: 53})
    .then((result) => result) 

const personIdentifier = new PersonIdentifierService

personIdentifier.browse()
    .then((result) => result)

personIdentifier.read(1)
    .then((result) => result)

personIdentifier.edit({id: 1, person_id: 48, identifier_type: 1})
    .then((result) => result)

personIdentifier.add({id: 11, person_id: 48, identifier_type: 4, identifier: 'blabla'})
    .then((result) => result)

personIdentifier.add({id: 12, person_id: 48, identifier_type: 2, identifier: 'blabla'})
    .then((result) => result)

personIdentifier.delete(11)
    .then((result) => result)

personIdentifier.delete(12)
    .then((result) => result)

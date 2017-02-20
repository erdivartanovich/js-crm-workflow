const PersonFamilyService = require('./Services/Person/person-family-service')

const familyService = new PersonFamilyService

familyService.read(1)
    .then((result) => result) 

familyService.edit({id: 1, person_id: 66, related_to: 53})
    .then((result) => result) 
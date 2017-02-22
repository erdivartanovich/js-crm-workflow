const PersonFamilyService = require('./Services/Person/person-family-service')
const PersonIdentifierService = require('./Services/Person/person-identifier-service')
const PersonScoresService = require('./Services/Person/person-scores-service')

//person family
const familyService = new PersonFamilyService

familyService.read(1)
    .then((result) => result)

familyService.edit({id: 1, person_id: 66, related_to: 53})
    .then((result) => result)

//person identifier
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

//person scores
const personScores = new PersonScoresService

personScores.browse()
    .then((result) => result)

personScores.read(1)
    .then((result) => result)

personScores.edit({id: 1, person_id: 45, score_type: 2, model_applied: 'Model CRMFoundation\lied', score: 4.3, confidence: 50})
    .then((result) => result)

personScores.add({id: 143, person_id: 1, score_type: 2, model_applied: 'Model CRMFoundation\lied', score: 4.3, confidence: 50})
    .then((result) => result)

personScores.delete(143)
    .then((result) => result)

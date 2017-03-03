'use strict'

const di = require('../../di')

class TargetServiceFactory {

    constructor(action) {
        this.action = action
    }
    
    serviceMap()
    {
        return {
            'persons': 'PersonService',
            'person_contexts': 'PersonContext',
            'motivations': 'PersonMotivation',
            'person_scores': 'PersonScore',
            'person_types': 'PersonType',
            // execute
            'social_append': 'SocialAppend',
            'mailer': 'MailClient',
            'sms': 'SMS',
            'tagger'  : 'Tagger'
        }
    }

}

module.exports = TargetServiceFactory

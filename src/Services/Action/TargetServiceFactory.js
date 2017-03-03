'use strict'

const di = require('../../di')

class TargetServiceFactory {

    constructor(action) {
        this.action = action
    }
    
    serviceMap() {
        return {
            'persons': 'PersonService',
            'motivations': 'PersonMotivation',
            'person_scores': 'PersonScore',
            // execute
            'social_append': 'SocialAppend',
            'mailer': 'MailClient',
            'sms': 'SMS',
            'tagger'  : 'Tagger'
        }
    }

    make() {
        if (!this.action.target_class) {
            return null
        }

        return di.container[this.serviceMap()[this.action.target_class]]
    }
}

module.exports = TargetServiceFactory

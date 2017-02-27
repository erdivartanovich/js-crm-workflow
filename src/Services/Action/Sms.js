'use strict'

const interactionService = require('../Interaction/InteractionService')
const moment = require('moment')
const phoneService = require('../Person/PersonPhoneService')
// FIXME with add interactionInterface

class Sms {

    constructor() {
        //FIXME with KWApi js
        this.api = 'KWApi'
        this.interactionService = interactionService
        this.phoneService = phoneService

    }

    send(workflow, action, person, message) {

        //FIXME with communication template Service.
        const communicationTemplate = action.getTemplate()
        if (communicationTemplate) {
            const message = communicationTemplate.setTemplateData(person, workflow.user_id)
        }
        this.phoneService.browse().where({person_id: person.id}).then(data => {
            const phones = data

            phones.forEach(function(phone) {
                const res = this.api.communication().sendText(phone.number, message)

                if (!res.isError()) {
                    const INITIATED_BY_USER = 1
                    const INTERACTION_TYPE_TEXT = 4
                    const interaction = {
                        person_id: person.id,
                        user_id: workflow.user_id,
                        interaction_type: INTERACTION_TYPE_TEXT,
                        interaction_at: moment().format('Y-m-d H:i:s'),
                        phone_number: phone.number,
                        initiated_by: INITIATED_BY_USER,
                    }
                    this.interactionService.add(interaction)
                }
            }, this)
        })
    }

    sendPrimary(workflow, action, person, message) {
        // FIXME
        const communicationTemplate = action.getTemplate()
        if (communicationTemplate) {
            const message = communicationTemplate.setTemplateData(person, workflow.user_id)
        }
        this.phoneService.browse().where({is_primary: 1, person_id: person.id}).first().then(data => {
            const phone = data
            if (phone) {
                const res = this.api.communication().sendText(phone.getNumber(), message)

                if (!res.isError()) {
                    const INITIATED_BY_USER = 1
                    const INTERACTION_TYPE_TEXT = 4
                    
                    const interaction = {
                        person_id: person.id,
                        user_id: workflow.user_id,
                        interaction_type: INTERACTION_TYPE_TEXT,
                        interaction_at: moment().format('Y-m-d H:i:s'),
                        phone_number: phone.number,
                        initiated_by: INITIATED_BY_USER,
                    }
                    this.interactionService.add(interaction)
                }                                
            }
        })
    }
}

module.exports = Sms

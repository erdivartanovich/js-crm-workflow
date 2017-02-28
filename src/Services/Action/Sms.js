'use strict'

const interactionService = require('../Interaction/InteractionService')
const moment = require('moment')
const phoneService = require('../Person/PersonPhoneService')
const communicationTemplateService = require('../CommunicationTemplate/CommunicationTemplateService')
// FIXME with add interactionInterface

class Sms extends communicationTemplateService{

    constructor() {
        //FIXME with KWApi js
        super()
        this.api = 'KWApi'
        this.interactionService = new interactionService()
        this.phoneService = new phoneService()
        this.communicationTemplateService = new communicationTemplateService()
    }

    send(workflow, action, person, message) {
        this.communicationTemplateService.read(action.template_id).then(response => {
            const communicationTemplate = response 
            if (communicationTemplate) {
                message = communicationTemplate.template
            }
            this.phoneService.readBy('person_id', person.id).then(data => {

                const phones = data

                phones.forEach(function(phone) {
                    //FIXME with KWApi.
                    const res = this.api.communication().sendText(phone.number, message)

                    if (!res.isError) {
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
        })
    }

    sendPrimary(workflow, action, person, message) {
        // FIXME

        this.communicationTemplateService.read(action.template_id).then(response => {
            const communicationTemplate = response 
            if (communicationTemplate) {
                message = communicationTemplate.template
            }
            this.phoneService.getPrimary('person_id', person.id).first().then(data => {
                const phone = data
                if (phone) {
                    const res = this.api.communication().sendText(phone.number, message)

                    if (!res.isError) {
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
        })
    }
}

module.exports = Sms

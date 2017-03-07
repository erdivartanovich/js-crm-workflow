'use strict'

const interactionService = require('../../Services/Interaction/InteractionService')
const moment = require('moment')
const phoneService = require('../../Services/Person/PersonPhoneService')
const communicationTemplateService = require('../../Services/CommunicationTemplate/CommunicationTemplateService')
const KWApi = require('../../../../kwapi-wrapper-js/lib/KWApi/index')

const INTERACTION_TYPE_TEXT = 4
const INITIATED_BY_USER = 1

class Sms extends communicationTemplateService{

    constructor() {
        //FIXME with KWApi js
        super()
        // this.api = 'KWApi'
        this.api = KWApi
        this.interactionService = new interactionService()
        this.phoneService = new phoneService()
        this.communicationTemplateService = new communicationTemplateService()
    }

    send(workflow, action, person, message) {
        const phones = []
        this.communicationTemplateService.read(action.template_id).then(response => {
            const communicationTemplate = response
            if (communicationTemplate) {
                message = communicationTemplate.template
            }
            this.phoneService.getNumbers('person_id', person.id).then(data => {

                const phones = data
                console.log(phones)
                phones.forEach(function(phone) {
                    //FIXME with KWApi.
                    const res = this.api.communication().sendText(phone.number, message)

                    if (!res.isError) {

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
        // FIXME with add KWApi

        this.communicationTemplateService.read(action.template_id).then(response => {
            const communicationTemplate = response
            if (communicationTemplate) {
                message = communicationTemplate.template
            }
            this.phoneService.getPrimary('person_id', person.id)
            .then(data => {
                const phone = data
                console.log(phone)
                if (phone) {
                    const res = this.api['Communication'].sendText(phone.number, message)

                    if (!res.isError) {

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

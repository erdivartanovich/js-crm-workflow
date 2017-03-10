'use strict'

const moment = require('moment')
const bluebird = require('bluebird')

const interactionService = require('../../Services/Interaction/InteractionService')
const phoneService = require('../../Services/Person/PersonPhoneService')
const communicationTemplateService = require('../../Services/CommunicationTemplate/CommunicationTemplateService')

const wrapper = require('@refactory-id/kwapi-wrapper-js')
const KWApi = wrapper.KWApi
const Credential = wrapper.Credential

const credential = new Credential('abc123')
const INTERACTION_TYPE_TEXT = 4
const INITIATED_BY_USER = 1

class Sms extends communicationTemplateService{

    constructor() {
        super()
        // Set endPoint of kwapi-wrapper-js
        credential.setEndPoint('http://localhost:8000/v1')
        this.wrapper = new KWApi(credential)
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
                const api = this.wrapper
                const interactionServ = this.interactionService

                // console.log(phones)
                return bluebird.each(phones, (phone) => {
                    return api.Communication().sendText(phone.number, message)
                    .then(() => {
                        const interaction = {
                            person_id: person.id,
                            user_id: workflow.user_id,
                            interaction_type: INTERACTION_TYPE_TEXT,
                            interaction_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            phone_number: phone.number,
                            initiated_by: INITIATED_BY_USER,
                        }

                        return interactionServ.add(interaction).then(() => {
                            // return Promise.resolve(true)
                        })
                    })
                    .then(() => {
                        return Promise.resolve(true)
                    })
                })
                .catch(err => console.log(err))
            })
        })
    }

    sendPrimary(workflow, action, person, message) {

        return this.communicationTemplateService.read(action.template_id)
        .then(response => {
            // console.log('Im here guys ....', response)
            const communicationTemplate = response
            if (communicationTemplate) {
                message = communicationTemplate.template
            }
            return this.phoneService.getPrimary('person_id', person.id)
            .then(data => {
                const phone = data

                const api = this.wrapper

                if (phone) {
                    return api.Communication().sendText(phone.number, message)
                    .then(() => {

                        const interaction = {
                            person_id: person.id,
                            user_id: workflow.user_id,
                            interaction_type: INTERACTION_TYPE_TEXT,

                            interaction_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            phone_number: phone.number,
                            initiated_by: INITIATED_BY_USER,
                        }

                        return this.interactionService.add(interaction).then(() => {
                            return Promise.resolve(true)
                        })
                    })
                    .catch(err => console.log(err))
                }
                return Promise.resolve(false)
            })
        })
    }
}

module.exports = Sms

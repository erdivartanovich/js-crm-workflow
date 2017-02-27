'use strict'

const interactionService = require('../Interaction/InteractionService')
const moment = require('../../moment')
const phoneService = require('../Person/PersonPhoneService')
// FIXME with add interactionInterface

class Sms {

    constructor() {
        //FIXME with KWApi js
        this.api = 'KWApi'
        this.interaction = interactionInterface;
        this.interactionService = interactionService;
        this.phoneService = phoneService;

    }

    send(workflow, action, person, message) {

        //FIXME
        const communicationTemplate = action.getTemplate();
        if (template) {
            const message = communicationTemplate.setTemplateData(person, workflow.getOwner());
        }
        this.phoneService.browse().where({person_id: person.id}).then(data => {
        const phones = data;

        phones.forEach(function(phone) {
            const res = this.api.communication().sendText(phone.getNumber(), message);

            if (!res.isError()) {
                const INITIATED_BY_USER = 1;
                const INTERACTION_TYPE_TEXT = 4;

                this.interaction.setPerson(person);
                this.interaction.setUser(workflow.getOwner());
                this.interaction.setInteractionType(INTERACTION_TYPE_TEXT);
                this.interaction.setInteractionAt(moment().format('Y-m-d H:i:s'));
                this.interaction.setPhoneNumber(phone.getNumber());
                this.interaction.setInitiatedBy(INITIATED_BY_USER);
                this.interactionService.add(this.interaction);
            }
        }, this);
        });
    }

    sendPrimary(workflow, action, person, message) {
        // FIXME
        const communicationTemplate = action.getTemplate();
        if (communicationTemplate) {
            const message = communicationTemplate.setTemplateData(person, workflow.getOwner());
        }
        this.phoneService.browse().where({is_primary: 1, person_id: person.id}).first().then(data => {
            const phone = data;
            if (phone) {
            const res = this.api.communication().sendText(phone.getNumber(), $message);

            if (!res.isError()) {
                    const INITIATED_BY_USER = 1;
                    const INTERACTION_TYPE_TEXT = 4;

                    this.interaction.setPerson(person);
                    this.interaction.setUser(workflow.getOwner());
                    this.interaction.setInteractionType(INTERACTION_TYPE_TEXT);
                    this.interaction.setInteractionAt(moment().format('Y-m-d H:i:s'));
                    this.interaction.setPhoneNumber(phone.getNumber());
                    this.interaction.setInitiatedBy(INITIATED_BY_USER);
                    this.interactionService.add(this.interaction);
                }                                
            }
        });
    }
}
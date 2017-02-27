'use strict'

const basePath = '../../../src'
const Sms = require(basePath+'/Services/Action/Sms') 
var tracker = require('mock-knex').getTracker()
var td = require('testdouble')

describe('--||=======SMSAction=======>', () => {
    let workflow, action, person
    before(() => {
        workflow = {
            user_id: 10,
            name: 'promote-hot-lead',
            is_shared: 1,
            is_activated: 0,
            deleted_at: ''
        }
        action = {
            action_type: 3,
            task_id: '',
            template_id: '',
            target_class: 'sms',
            target_field: 'sendPrimary',
            value: 'Hey, You are promoted to hot lead.',
            name: 'send-hot-lead-promotion-sms',
            deleted_at: ''            
        }
        person = {
            first_name: 'Arigi',
            middle_name: '',
            last_name: 'Wiratama',
            date_of_birth: '1998-11-08',
            is_pre_approved: 1,
            is_primary: 1,
            prefix: 'Mr.',
            suffix: 'Ajussi',
            is_starred: 0,
            primary_motivation_note: 'just be yourself, you are bigger than you think',
            permanent_deleted_at: '',
            user_id: 10,
            stage_id: 3,
            lead_type_id: 1
        } 
    })

    describe('#send()', () => {
            let subject, sendTheSms
        beforeEach(() => {
            sendTheSms = td.function('sendTheSms')
            subject = new Sms(sendTheSms)
        })
        it('should send sms to person phone', () => {
            subject.send(workflow, action, person)
        })
    })
    describe('#sendPrimary()', () => {
            let subject, sendPrimarySms
        beforeEach(() => {
            sendPrimarySms = td.function('sendPrimarySms')
            subject = new Sms(sendPrimarySms)
        })
        it('should send SMS to primary person phone', () => {
            subject.sendPrimary()
        })
    })
})
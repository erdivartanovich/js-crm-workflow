'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class PersonContactTypeService extends BaseService {

    constructor() {
        super()
        this.tableName = 'person_contact_types'
    }

    // TODO: Finish sync method
    sync(person, contactTypes) {
        return knex.transaction(trx => {
            return trx.from(this.tableName).where('person_id', person.id).del().then(() => {
                return trx.insert(contactTypes.map(type => {
                    type.person_id = person.id

                    return type
                })).into(this.tableName)
            })
        })
    }
}

module.exports = PersonContactTypeService

const BaseService = require('../BaseService')
const knex = require('../../connection')

class PersonContactTypeService extends BaseService {

    constructor() {
        super()
        this.tableName = 'person_contact_types'
    }

    sync(person, ...contactType) {
        return knex.transaction((trx) => {
            trx.from(this.tableName)
                .where('person_id', person.id)
                .del()
                .then(() => {
                    const normalizedContactType = contactType.map((val) => {
                        return val.person_id = person.id
                    })

                    return trx.into(this.tableName)
                        .insert(normalizedContactType)
                })
        })

    }
}

module.exports = PersonContactTypeService

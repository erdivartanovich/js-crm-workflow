'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class PersonMotivationService extends BaseService{

    constructor() {
        super()
        this.tableName = 'person_motivations'
    }

	// sync(person, motivations) {
	// 	return knex(this.tablename)
	// 		.where('person_motivations.person_id', person.id)
	// 		.delete()
	// 		.then(() => {
	// 			// loop motivations table
	// 			motivations.map(function(motivation) {
	// 				knex(this.tablename)
	// 				.insert(motivation)
	// 			})
	// 		})
	// }

    sync(person, motivations) {
        return knex.transaction(trx => {
            return trx.from(this.tableName).where('person_id', person.id).delete().then(() => {
                return trx.insert(motivations.map(item => {
                    item.person_id = person.id
                    return item
                })).into(this.tableName)
            })
        })
    }

}

module.exports = PersonMotivationService

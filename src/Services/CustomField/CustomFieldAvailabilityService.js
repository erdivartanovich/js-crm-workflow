'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class CustomFieldAvailabilityService extends BaseService{

    /**
     * constructor
     */
    constructor(){
        super()
        //set the table name
        this.tableName = 'custom_field_availability'
    }

    /**
     * Sync availability for given custom field based on list of object_type.
     *
     * @param CustomFieldInterface $customField
     * @param string               ...$objectTypes string of object types
     *
     * @return array with key `added` and `deleted` which is count total record added and deleted
     */
    sync(customField, objectTypes) {
		return knex.transaction(trx => {
			return trx.from(this.tableName).where('field_id', customField.id).delete().then(() => {
				return trx.insert(objectTypes.map(item => {
					item.field_id = customField.id
					return item
				})).into(this.tableName)
			})
		})
	}

}

module.exports = CustomFieldAvailabilityService

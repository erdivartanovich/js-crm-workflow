'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class PreferenceService extends BaseService {

    /**
     * Find preference model.
     *
     * @param preferenceable Preferenceable entity with id and type property ==> {id: #, type: ''}
     * @param identifier     Key to find
     * @param type           Preference type
     *
     * @return PreferenceInterface
     */

    constructor() {
        super()
        this.model = knex('preferences')
    }

    find(preferenceable, identifier, type) {
        const preferenceableObj = {preferenceable_id: preferenceable.id, preferenceable_type: preferenceable.type}
        
        return this.model.where(preferenceableObj)
            .where({identifier: identifier, type: type})
    }    

}

module.exports = PreferenceService
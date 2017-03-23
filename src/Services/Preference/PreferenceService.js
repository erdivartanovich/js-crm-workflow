'use strict';

const BaseService = require('../BaseService')

class PreferenceService extends BaseService {

    /**
     * Find preference model.
     *
     * @param preferenceable Preferenceable entity
     * @param identifier     Key to find
     * @param type           Preference type
     *
     * @return PreferenceInterface
     */

    constructor() {
        super()
        this.model = 'preferences'
    }

    find(preferenceable, identifier, type) {
        const preference = {preferenceable, identifier, type};
        return this.model.where(preference)
    }    

}

module.exports = PreferenceService
'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class InteractionService extends BaseService{

    constructor(){
        super()
        this.tableName = 'interactions'
        // init knex model
        this.model = knex(this.tableName)
    }

    getInitialInteractionFor(user, person, excludeId) {
        return this.model.where({
            'interactions.user_id': user.id,
            'interactions.person_id': person.id
        }).whereNotIn('interactions.id', excludeId)
        .orderBy('interaction_at', 'asc')
        .select('interactions.*')
        .first()
    }

    /**
     * {@inheritdoc}
     */
    getLastInteractionFor(user, person, excludeId) {
        return this.model.where({
            'interactions.user_id': user.id,
            'interactions.person_id': person.id
        }).whereNotIn('interactions.id', excludeId)
        .orderBy('interaction_at', 'desc')
        .select('interactions.*')
        .first()
    }
}

module.exports = InteractionService

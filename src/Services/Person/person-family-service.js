'use strict'

const knex = require('../../connection')

const moment = require('moment')
const DATEFORMAT = 'YYYY-MM-DD HH:mm:ss'

//Empty entity object
var entity = {}

class PersonFamilyService {
    
    constructor() {
        this.tableName = 'person_family'
        
    }

    browse() {
        return knex(this.tableName)
    }
    
    read(id) {
        return knex
            .select()
            .from(this.tableName)            
            .where('id', id)
            .first()
    }

    edit(personFamily) {
        entity = this.editTimestamp(personFamily)
        return knex(this.tableName)         
            .where('id', entity.id)
            .update(entity)
    }

    add(personFamily) {
        entity = this.addTimestamp(personFamily)
        return knex(this.tableName)         
            .insert(entity)
    }

    delete(id) {
        return knex(this.tableName)   
            .where('id', id)      
            .del()
    }

    addTimestamp(payload) {
        if (! payload.created_at) {
            payload.created_at = (new moment).format(DATEFORMAT)
        }

        payload = this.editTimestamp(payload)

        return payload
    }

    editTimestamp(payload) {
        if (! payload.updated_at) {
            payload.updated_at = (new moment).format(DATEFORMAT)
        }

        return payload
    }
}

module.exports = PersonFamilyService
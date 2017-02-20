const knex = require('../../connection')

class PersonIdentifierService {

    constructor() {
        this.tableName = 'person_identifiers'
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

    edit(personIdentifier) {
        return knex(this.tableName)         
            .where('id', personIdentifier.id)
            .update(personIdentifier)
    }

    add(personIdentifier) {
        return knex(this.tableName)         
            .insert(personIdentifier)
    }

    delete(id) {
        return knex(this.tableName)   
            .where('id', id)      
            .del()
    }
}

module.exports = PersonIdentifierService
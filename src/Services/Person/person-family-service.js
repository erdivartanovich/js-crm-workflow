const knex = require('../../connection')

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
        return knex(this.tableName)         
            .where('id', personFamily.id)
            .update(personFamily)
    }

    add(personFamily) {
        return knex(this.tableName)         
            .insert(personFamily)
    }

    delete(id) {
        return knex(this.tableName)   
            .where('id', id)      
            .del()
    }
}

module.exports = PersonFamilyService
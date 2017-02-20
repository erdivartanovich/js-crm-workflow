const knex = require('../../connection')

class PersonScoresService {

    constructor() {
        this.tableName = 'person_scores'
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

    edit(personScore) {
        return knex(this.tableName)         
            .where('id', personScore.id)
            .update(personScore)
    }

    add(personScore) {
        return knex(this.tableName)         
            .insert(personScore)
    }

    delete(id) {
        return knex(this.tableName)   
            .where('id', id)      
            .del()
    }
}

module.exports = PersonScoresService
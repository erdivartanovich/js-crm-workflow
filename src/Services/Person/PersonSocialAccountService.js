const knex = require('../../connection')

class PersonSocialAccountService{
    constructor(){
        this.tableName = 'person_social_accounts'
        this.id = 'id'
    }

    browse(){
        return knex(this.tableName)
    }

    read(id){
        return knex
              .select()
              .from(this.tableName)
              .where(this.id, id)
              .first()
    }

    edit(personSocialAccount){
        return knex(this.tableName)
               .where(this.id, personSocialAccount.id)
               .update(personSocialAccount)
    }

    add(personSocialAccount){
        return knex(this.tableName).insert(personSocialAccount)
    }

    delete(id){
        return knex(this.tableName).where(this.id, id).del()
    }
}


module.exports = PersonSocialAccountService

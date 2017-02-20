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

    edit(personSocialAccountService){
        return knex(this.tableName)
               .where(this.id, personSocialAccountService.id)
               .update(personSocialAccountService)
    }

    add(personSocialAccountService){
        return knex(this.tableName).insert(personSocialAccountService)
    }

    delete(id){
        return knex(this.tableName).where(this.id, id).del()
    }
}


module.exports = PersonSocialAccountService

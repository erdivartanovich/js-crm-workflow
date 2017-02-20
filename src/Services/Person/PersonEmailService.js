const knex = require('../../connection')



class PersonEmailService {



    constructor() {
        this.tableName = 'person_emails'
        this.id = 2

    }


    // browse success
    browse() {

        return knex(this.tableName)
    }


    // read success
    read(id) {

        return knex

            .select()

            .from(this.tableName)

            .where('id', this.id)

            .first()

    }


    // edit success
    edit(email) {

    return knex(this.tableName)

      .where('id', email.id)

      .update(email)

  }


    // add success
    add(email) {

    return knex(this.tableName).insert(email)

  }


    // delete success
    delete(id) {

    return knex(this.tableName)

    .where('id', this.id)

    .del()

  }

}



module.exports = PersonEmailService

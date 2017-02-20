const knex = require('../../connection')



class PersonEmailService {



    constructor() {
        this.tableName = 'person_emails'
<<<<<<< 788fbe0d753492a6f85dfdb22030be6ccdca2b65
        this.id = `id`
=======
        this.identifier = 2
>>>>>>> #34 Rewrite Person Email Service

    }


    // browse success
    browse() {

        return knex(this.tableName)
    }


    // read success
    read(id) {

<<<<<<< 788fbe0d753492a6f85dfdb22030be6ccdca2b65
        return knex.select().from(this.tableName).where(this.id, id).first()
=======
        return knex

            .select()

            .from(this.tableName)

            .where('id', this.identifier)

            .first()
>>>>>>> #34 Rewrite Person Email Service

    }


    // edit success
    edit(email) {

<<<<<<< 788fbe0d753492a6f85dfdb22030be6ccdca2b65
      return knex(this.tableName).where(this.id, email.id).update(email)
=======
    return knex(this.tableName)

      .where('id', email.id)

      .update(email)
>>>>>>> #34 Rewrite Person Email Service

  }


    // add success
    add(email) {

<<<<<<< 788fbe0d753492a6f85dfdb22030be6ccdca2b65
      return knex(this.tableName).insert(email)
=======
    return knex(this.tableName).insert(email)
>>>>>>> #34 Rewrite Person Email Service

  }


    // delete success
    delete(id) {

<<<<<<< 788fbe0d753492a6f85dfdb22030be6ccdca2b65
      return knex(this.tableName).where(this.id, id).del()
=======
    return knex(this.tableName)

    .where('id', this.identifier)

    .del()
>>>>>>> #34 Rewrite Person Email Service

  }

}



module.exports = PersonEmailService

'use strict'

const knex = require('../connection')
const moment = require('moment')
const DATEFORMAT = 'YYYY-MM-DD HH:mm:ss'

class BaseService {
    /**
     * Constructor
     */
    constructor() {
        //set tablename to null, when extends need to intialize it with string value
        //softDelete flag is set to default = true 
        this.tableName = null
        this.softDelete = true
    }

    browse() {
        //delete from current table where deleted at = null
        return knex(this.tableName)
            .where('deleted_at', null)
    }

    read(id) {
        //select from current table where table.id=id 
        return knex(this.tableName)
            .where('deleted_at', null)
            .where('id', id)
            .first()
    }

    edit(payload) {
        //add timestamp before edit to payload
        this.beforeEdit(payload)
        
        //update where table.id = payload.id
        return knex(this.tableName)
            .where('id', payload['id'])
            .update(payload)
    }

    add(payload) {
        //add timestamp before edit to payload
        this.beforeAdd(payload)

        //insert payload to current table
        return knex(this.tableName)
            .insert(payload)
    }

    delete(payload, isForced) {
        //create query delete
        const query =  knex(this.tableName).where('id', payload['id'])
        
        //if isForced and isSoftDelete then add deleted timestamp
        if ( ! isForced && this.softDelete) {
            return query.update({'deleted_at': this.getNow()})
        }
        //execute query
        return query.del()
    }

    forceDelete(payload) {
        return this.delete(payload, true)
    }

    beforeAdd(payload) {
        //add timestamp on before add
        if (! payload.created_at) {
            payload.created_at = this.getNow()
        }

        if (! payload.updated_at) {
            payload.updated_at = this.getNow()
        }
    }

    beforeEdit(payload) {
        //add timestamp on before edit
        if (! payload.updated_at) {
            payload.updated_at = this.getNow()
        }

    }
    
    getNow() {
        //get current timestamp
        return (new moment).format(DATEFORMAT)
    }

}

module.exports = BaseService

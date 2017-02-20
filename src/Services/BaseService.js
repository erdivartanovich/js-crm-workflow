const knex = require('../connection')
const moment = require('moment')
const DATEFORMAT = 'YYYY-MM-DD HH:mm:ss'

class BaseService {

    constructor() {
        this.tableName = null
        this.softDelete = true
    }

    browse() {
        return knex(this.tableName)
            .where('deleted_at', null)
    }

    read(id) {
        return knex(this.tableName)
            .where('deleted_at', null)
            .where('id', id)
            .first()
    }

    edit(payload) {
        this.beforeEdit(payload)
        return knex(this.tableName)
            .where('id', payload['id'])
            .update(payload)
    }

    add(payload) {
        this.beforeAdd(payload)
        return knex(this.tableName)
            .insert(payload)
    }

    delete(payload, isForced) {
        const query =  knex(this.tableName).where('id', payload['id'])

        if ( ! isForced && this.softDelete) {
            return query.update({'deleted_at': this.getNow()})
        }

        return query.del()
    }

    forceDelete(payload) {
        return this.delete(payload, true)
    }

    beforeAdd(payload) {
        if (! payload.created_at) {
            payload.created_at = this.getNow()
        }

        if (! payload.updated_at) {
            payload.updated_at = this.getNow()
        }
    }

    beforeEdit(payload) {
        if (! payload.updated_at) {
            payload.updated_at = this.getNow()
        }

    }
    
    getNow() {
        return (new moment).format(DATEFORMAT)
    }

}

module.exports = BaseService

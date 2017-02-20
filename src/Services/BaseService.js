const knex = require('../connection')
const moment = require('moment')
const DATEFORMAT = 'YYYY-MM-DD HH:mm:ss'

class BaseService {

    constructor() {
        this.id = 'id'
        this.softDelete = true
    }

    browse() {
        return knex(this.tableName)
    }

    read(id) {
        return knex(this.tableName)
            .where(this.id, id)
            .first()
    }

    edit(payload) {
        payload = this.editTimestamp(payload)

        return knex(this.tableName)
            .where(this.id, payload[this.id])
            .update(payload)
    }

    add(payload) {
        payload = this.addTimestamp(payload)

        return knex(this.tableName)
            .insert(payload)
    }

    delete(id, isForced) {
        const query =  knex(this.tableName).where(this.id, id)

        if ( ! isForced && this.softDelete) {
            return query.update({'deleted_at': this.getNow()})
        }

        return query.del()
    }

    forceDelete(id) {
        return this.delete(id, true)
    }

    beforeAdd(payload) {
        if (! payload.created_at) {
            payload.created_at = this.getNow()
        }

        return this.editTimestamp(payload)
    }

    beforeEdit(payload) {
        if (! payload.updated_at) {
            payload.updated_at = this.getNow()
        }

        return payload
    }

    getNow() {
        return (new moment).format(DATEFORMAT)
    }
}

module.exports = BaseService

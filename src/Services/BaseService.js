const knex = require('../connection')
const moment = require('moment')
const DATEFORMAT = 'YYYY-MM-DD HH:mm:ss'

class BaseService {


    constructor() {
        this.id = 'id'
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

    delete(id) {
        return knex(this.tableName)
            .where(this.id, id)
            .del()
    }

    addTimestamp(payload) {
        if (! payload.created_at) {
            payload.created_at = (new moment).format(DATEFORMAT)
        }

        return this.editTimestamp(payload)
    }

    editTimestamp(payload) {
        if (! payload.updated_at) {
            payload.updated_at = (new moment).format(DATEFORMAT)
        }

        return payload
    }
}

module.exports = BaseService

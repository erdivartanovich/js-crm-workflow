'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class UserService extends BaseService {

    constructor() {
        super()
        this.tableName = 'users'
    }

    retrieveByToken(id, token) {
        return this.read(id).where('remember_token', token)
    }

    retrieveByCredentials(credentials) {
        if (typeof credentials == 'undefined' || credentials.length == 0) {
            return undefined
        }

        let checkingCredentials = {}

        for (const key in credentials) {
            if (key == 'password') {
                continue
            }

            checkingCredentials[key] = credentials[key]
        }

        return knex(this.tableName).where(checkingCredentials).where('deleted_at', null).first()
    }
}

module.exports = UserService

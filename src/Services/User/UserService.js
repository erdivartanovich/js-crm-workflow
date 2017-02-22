'use strict'

const BaseService = require('../BaseService')

class UserService extends BaseService {

    constructor() {
        super()
        this.tableName = 'users'
    }

    retrieveByToken(id, token) {
        // TODO: implements retrieveByToken
    }

    validateCredentials(user, credentials) {
        // TODO: implements validateCredentials
    }

    retrieveByCredentials(credentials) {
        // TODO: implements retrieveByCredentials
    }

    changePassword(user, password) {
        // TODO: implements changePassword

        // generate hash for password
        const generatedPassword = password

        // Assign newly added password into user
        return super.edit({id: user.id, password: generatedPassword})
    }
}

module.exports = UserService

'use strict'

const envloader = require('./Envloader')

const config = {
    storage : {
        db1: {
            host: envloader.get('DB_HOST').whenEmpty('127.0.0.1'),
            port: envloader.get('DB_PORT').whenEmpty(3306),
            database: envloader.get('DB_DATABASE').whenEmpty('crm'),
            user: envloader.get('DB_USERNAME').whenEmpty('root'),
            password: envloader.get('DB_PASSWORD').whenEmpty('root')
        },
        db2: {
            host: envloader.get('DB_HOST').whenEmpty('localhost'),
            port: envloader.get('DB_PORT').whenEmpty(3306),
            database: envloader.get('DB_DATABASE').whenEmpty('homestead'),
            user: envloader.get('DB_USERNAME').whenEmpty('homestead'),
            password: envloader.get('DB_PASSWORD').whenEmpty('secret')
        }

    }
}

module.exports = config

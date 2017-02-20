const config = require('../config/config.js')

const knex = require('knex')({
    client: 'mysql',
    connection: config.storage.db1,
    debug: true
})

module.exports = knex

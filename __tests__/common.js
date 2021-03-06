'use strict'

const chai = require('chai')
chai.should()
chai.use(require('chai-as-promised'))

global.mockDB = require('mock-knex')
global.knex = require('../src/connection')

global.mockDB.mock(global.knex)
global.tracker = mockDB.getTracker()

global.expect = chai.expect

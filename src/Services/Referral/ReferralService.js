'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class ReferralService extends BaseService {

	constructor() {
		super()
		this.tableName = 'referrals'
	}

	getBy(source, referrer) {

	}

	setAsPrimary(referral) {
		
	}
}

module.exports = ReferralService
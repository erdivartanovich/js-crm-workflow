const BaseService = require('../BaseService')
const knex = require('../../connection')

class MessageBankService extends BaseService {

	constructor() {
		super()
		this.tableName = 'message_bank'
	}

	incUsageCount(messageBank) {
		return knex(this.tableName)
			.where('id', messageBank.id)
			.increment('usage_count', 1)
	}
}

module.exports = MessageBankService
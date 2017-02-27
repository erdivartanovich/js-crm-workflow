'use strict'

const BaseService = require('../BaseService')
const knex = require('../../connection')

class ReferralService extends BaseService {

	constructor() {
		super()
		this.tableName = 'referrals'
	}

	sync(referrerable, sources) {
		return knex.transaction(trx => {
			return trx.from(this.tableName)
				.where({
					referrerable_id: referrerable.referrerable_id,
					referrerable_type: referrerable.referrerable_type
				})
				.delete()
				.then(() => {
					return trx.insert(sources.map(item => {
						item.referrerable_id = referrerable.referrerable_id
						item.referrerable_type = referrerable.referrerable_type
						return item
					})).into(this.tableName)
				})
		})
	}

	getBy(source, referrer) {
		
		const newObject = {
			source_id: source.id,
			source_type: 'sources',
			referrerable_id: referrer.id,
			referrerable_type: 'persons'
		}

		return knex(this.tableName)
			.where({
				source_id: source.id,
				source_type: 'sources',
				referrerable_id: referrer.id,
				referrerable_type: 'persons'
			}).first()
		.then(result => {
			if(typeof result ===  'undefined') {
				this.add(newObject)
					.then(() => {
						return knex(this.tableName).orderBy('id', 'desc').first()
					})
					.then(result => {
						return result
					})
			}
			// console.log(result)
			return result
		})
	}

	setAsPrimary(referral) {
		//reset current is_primary
		return knex(this.tableName)
			.where({
				referrerable_id: referral.referrerable_id,
				referrerable_type: referral.referrerable_type,
				is_primary: 1
			})
			.update('is_primary', 0)
		.then(() => {
			return knex(this.tableName)
				.where('id', referral.id)
				.update('is_primary', 1)
		})
	}
}

module.exports = ReferralService
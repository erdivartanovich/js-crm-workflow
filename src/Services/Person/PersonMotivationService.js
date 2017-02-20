require ('lodash')

class PersonMotivationService {

	constructor(PersonMotivationRepositoryInterface) {
		this.repository = PersonMotivationRepositoryInterface
	}

	create(motivation) {
		return this.repository.create(motivation)
	}

	update(motivation) {
		return this.repository.update(motivation)
	}

	delete(motivation) {
		return this.repository.delete(motivation)
	}

	sync(person, ...motivations) {
		const compareKey = ['getMotivation.getKey']

		const toSync = _.map(motivations, motivation => {
			return new PersonMotivation().setPerson(person).setMotivation(motivation)
		})
		const currents = this.repository.getFor(person)

		const toDelete = currents.filterNoExistIn($toSync, compareKey)
		const noChange = currents.filterNoExistIn(toDelete, ['getKey'])
		const toAdd = toSync.filterNoExistIn(noChange, compareKey)

		const result = {
			deleted : 0,
			added : 0
		}

		if(toDelete.count > 0) {
			const ids = ._reduce(toDelete, function(carry, personMotivation)) {
				carry.push(personMotivation.getKey())
				return carry
			}, [])
			
			deleted = this.deleteMultiple(ids)
			result.deleted = deleted.delete_count
		}

		toAdd.map(function(instance){
			this.create(instance)
		})
		
		result.added = toAdd.count()

		return result

	}
}
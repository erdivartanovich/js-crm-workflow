class PersonLoginService {

	constructor(PersonLoginRepository) {
		this.repository = PersonLoginRepository
	}

	create(login) {
		return this.repository.create(login)
	}

	update(login) {
		return this.repository.update(login)
	}

	delete(login) {
		return this.repository.delete(login)
	}

}
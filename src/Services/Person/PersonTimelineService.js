const BaseService = require('../BaseService')

class PersonTimelineService extends BaseService {
  constructor() {
    super()
    this.tableName = 'person_timelines'
  }

}


module.exports = PersonTimelineService

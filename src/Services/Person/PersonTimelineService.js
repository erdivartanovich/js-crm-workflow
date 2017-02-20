const knex = require('../../connection')

class PersonTimelineService {
  constructor() {
    this.tableName = 'person_timelines'
  }

  browse() {
    return knex(this.tableName)
  }

  read(id) {
    return knex(this.tableName)
      .where('id', id)
      .first()
  }

  edit(personTimeline) {
    return knex(this.tableName)
      .where('id', personTimeline.id)
      .update(personTimeline)

  }

  add(personTimeline) {
    return knex(this.tableName)
      .insert(personTimeline)
  }

  delete(id) {
    return knex(this.tableName)
      .where('id', id)
      .del()
  }
}


module.exports = PersonTimelineService

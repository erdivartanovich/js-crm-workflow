//const leadType =  require('./LeadTypeService')
const Timeline = require('./PersonTimelineService')

const Query = new Timeline()


// Query.browse('person_timelines')
//   .then((result) => console.log(result))

// Query.read(100)
//   .then((result) => console.log(result))

// Query.edit({id: 4, timeline_type: 'null'})
//   .then((result) => console.log(result))


const personTimeline = {
  timeline_type: 6,
  person_id: null,
  activity_by: 1,
  timelineable_type: 'notes',
  timelineable_id: 9,
  activity_at: '2017-02-06 11:25:53',
  activity_type: 2
}

  Query.add(personTimeline)
    .then((result) => console.log(result))

// Query.delete(411)
//   .then((result) => console.log(result))

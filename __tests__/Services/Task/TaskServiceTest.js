const basePath = '../../../src'
const TaskService = require(basePath + '/Services/Task/TaskService')
var tracker = require('mock-knex').getTracker()

const testObj = new TaskService()
const expectQuery = {
  browse: 'select * from `tasks` where `deleted_at` is null',
  read: 'select * from `tasks` where `deleted_at` is null and `id` = ? limit ?',
  edit: 'update `tasks` set `created_by` = ?, `description` = ?, `due_date` = ?, `from_interaction` = ?, `id` = ?, `is_automated` = ?, `is_completed` = ?, `person_id` = ?, `reason` = ?, `status` = ?, `task_action` = ?, `task_type` = ?, `updated_at` = ?, `updated_by` = ?, `user_id` = ? where `id` = ?',
  add: 'insert into `tasks` (`created_at`, `created_by`, `description`, `due_date`, `from_interaction`, `id`, `is_automated`, `is_completed`, `person_id`, `reason`, `status`, `task_action`, `task_type`, `updated_at`, `updated_by`, `user_id`) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  del: 'update `tasks` set `deleted_at` = ? where `id` = ?'
}

const taskObject = {
  id: 1,
  user_id: 1,
  person_id: 1,
  task_type: 1,
  task_action: 'Custom Action',
  due_date: testObj.getNow(),
  from_interaction: 'From interaction',
  reason: 'good for you',
  description: 'Pholenk so handsome',
  is_completed: 1,
  is_automated: 1,
  status: 1,
  created_by: 12,
  updated_by: 12
}

describe('TaskService', () => {

  before(() => {
    tracker.install()

    tracker.on('query', function checkResult(query) {
      query.response(query)
    })
  })

  after(() => {
    tracker.uninstall()
  })

  // browse test that read all of data on DB
  describe('#browse()' , () => {
    it('should return a valid query', (done) => {
      testObj.browse(2).then(result => {
        result.sql.should.equals(expectQuery.browse)
        result.method.should.equals('select')
        done()
      }).catch(err => done(err))
    })
  })

  // read test that read a row data
  describe('#read()' , () => {
    it('should return a valid query', (done) => {
      const limit = 1

      testObj.read(taskObject.id).then(result => {
        result.sql.should.equals(expectQuery.read)
        result.method.should.equals('first')
        result.bindings[0].should.equals(taskObject.id)
        result.bindings[1].should.equals(limit)
        done()
      }).catch(err => done(err))
    })
  })

  // edit test that change country_code value
  describe('#edit()' , () => {
    it('should return a valid query', (done) => {

      testObj.edit(taskObject).then(result => {
        result.sql.should.equals(expectQuery.edit)
        result.method.should.equals('update')
        result.bindings[0].should.equals(taskObject.created_by)
        result.bindings[1].should.equals(taskObject.description)
        result.bindings[2].should.equals(taskObject.due_date)
        result.bindings[3].should.equals(taskObject.from_interaction)
        result.bindings[4].should.equals(taskObject.id)
        result.bindings[5].should.equals(taskObject.is_automated)
        result.bindings[6].should.equals(taskObject.is_completed)
        result.bindings[7].should.equals(taskObject.person_id)
        result.bindings[8].should.equals(taskObject.reason)
        result.bindings[9].should.equals(taskObject.status)
        result.bindings[10].should.equals(taskObject.task_action)
        result.bindings[11].should.equals(taskObject.task_type)
        result.bindings[12].should.not.empty
        result.bindings[13].should.equals(taskObject.updated_by)
        result.bindings[14].should.equals(taskObject.user_id)
        result.bindings[15].should.equals(taskObject.id)
        done()
      }).catch(err => done(err))
    })
  })

  // add test that insert data to DB
  describe('#add()' , () => {
    it('should return a valid query', (done) => {

      testObj.add(taskObject).then(result => {
        result.sql.should.equals(expectQuery.add)
        result.method.should.equals('insert')
        result.bindings[0].should.equals(taskObject.created_at)
        result.bindings[1].should.equals(taskObject.created_by)
        result.bindings[2].should.equals(taskObject.description)
        result.bindings[3].should.equals(taskObject.due_date)
        result.bindings[4].should.equals(taskObject.from_interaction)
        result.bindings[5].should.equals(taskObject.id)
        result.bindings[6].should.equals(taskObject.is_automated)
        result.bindings[7].should.equals(taskObject.is_completed)
        result.bindings[8].should.equals(taskObject.person_id)
        result.bindings[9].should.equals(taskObject.reason)
        result.bindings[10].should.equals(taskObject.status)
        result.bindings[11].should.equals(taskObject.task_action)
        result.bindings[12].should.equals(taskObject.task_type)
        result.bindings[13].should.should.not.empty
        result.bindings[14].should.equals(taskObject.updated_by)
        result.bindings[15].should.equals(taskObject.user_id)
        done()
      }).catch(err => done(err))
    })
  })

  // delete test that fill updated_at
  describe('#delete()' , () => {
    it('should return a valid query for soft delete', (done) => {
      const deleteId = 12

      testObj.delete({'id': deleteId}).then(result => {
        result.sql.should.equals(expectQuery.del)
        result.method.should.equals('update')
        result.bindings[0].should.not.empty
        result.bindings[1].should.equals(deleteId)
        done()
      }).catch(err => done(err))
    })

    // delete test that real delete data from DB
    it('should return a valid query for forced delete', (done) => {
      const deleteQuery = 'delete from `tasks` where `id` = ?'
      const deleteId = 12

      testObj.delete({'id': deleteId}, true).then(result => {
        result.sql.should.equals(deleteQuery)
        result.method.should.equals('del')
        result.bindings[0].should.equals(deleteId)
        done()
      }).catch(err => done(err))
    })
  })

  // activate test that fill / change status value to 1
  describe('#activate()', () => {
    it('should return a valid query for updated status column', (done) => {
      const activateQuery = 'update `tasks` set `status` = ?, `updated_at` = ?, `updated_by` = ? where `id` = ?'

      testObj.activate(taskObject).then(result => {
        result.sql.should.equals(activateQuery)
        result.method.should.equals('update')
        result.bindings[0].should.equals(1)
        result.bindings[1].should.not.empty
        result.bindings[2].should.equals(taskObject.updated_by)
        result.bindings[3].should.equals(taskObject.id)
        done()
      }).catch(err => done(err))
    })
  })

  // deactivate test that fill / change status value to 0
  describe('#deactivate()', () => {
    it('should return a valid query for updated status column', (done) => {
      const deactivateQuery = 'update `tasks` set `status` = ?, `updated_at` = ?, `updated_by` = ? where `id` = ?'

      testObj.deactivate(taskObject).then(result => {
        result.sql.should.equals(deactivateQuery)
        result.method.should.equals('update')
        result.bindings[0].should.equals(0)
        result.bindings[1].should.not.empty
        result.bindings[2].should.equals(taskObject.updated_by)
        result.bindings[3].should.equals(taskObject.id)
        done()
      }).catch(err => done(err))
    })
  })

  // markNotCompleted test that fill / change status value to 0
  describe('#markNotCompleted()', () => {
    it('should return a valid query for updated status column', (done) => {
      const markNotCompletedQuery = 'update `tasks` set `is_completed` = ?, `updated_at` = ?, `updated_by` = ? where `id` = ?'

      testObj.markNotCompleted(taskObject).then(result => {
        result.sql.should.equals(markNotCompletedQuery)
        result.method.should.equals('update')
        result.bindings[0].should.equals(0)
        result.bindings[1].should.not.empty
        result.bindings[2].should.equals(taskObject.updated_by)
        result.bindings[3].should.equals(taskObject.id)
        done()
      }).catch(err => done(err))
    })
  })

  // result first will be return null and it can't be checked, that why this test will check just bindings[1]
  describe('#restore()', () => {
    it('should return a valid query for restore data', (done) => {
      const restoreQuery = 'update `tasks` set `deleted_at` = ? where `id` = ?'
      const obj = {
        id: 25,
        deleted_at: null
      }

      testObj.restore(obj).then(result => {
        console.log(result)
        result.sql.should.equals(restoreQuery)
        result.method.should.equals('update')
        result.bindings[1].should.equals(obj.id)
        done()
      }).catch(err => done(err))
    })
  })
})

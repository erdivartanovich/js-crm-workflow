const basePath = '../../../src'
const CompanyService = require(basePath + '/Services/Company/CompanyService')
var tracker = require('mock-knex').getTracker()

const testObj = new CompanyService()
const expectQuery = {
  browse: 'select * from `companies` where `deleted_at` is null',
  read: 'select * from `companies` where `deleted_at` is null and `id` = ? limit ?',
  edit: 'update `companies` set `address` = ?, `id` = ?, `name` = ?, `updated_at` = ? where `id` = ?',
  add: 'insert into `companies` (`address`, `created_at`, `name`, `updated_at`) values (?, ?, ?, ?)',
  del: 'update `companies` set `deleted_at` = ? where `id` = ?'
}

describe('CompanyService', () => {

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
      const readId = 2
      const limit = 1

      testObj.read(readId).then(result => {
        result.sql.should.equals(expectQuery.read)
        result.method.should.equals('first')
        result.bindings[0].should.equals(readId)
        result.bindings[1].should.equals(limit)
        done()
      }).catch(err => done(err))
    })
  })

  // edit test that change country_code value
  describe('#edit()' , () => {
    it('should return a valid query', (done) => {
      const editObject = {
        id: 1, name: 'Kemmer, Wintheiser and Jakubowski', address: 'Arizona street'
      }

      testObj.edit(editObject).then(result => {
        result.sql.should.equals(expectQuery.edit)
        result.method.should.equals('update')
        result.bindings[0].should.equals(editObject.address)
        result.bindings[1].should.equals(editObject.id)
        result.bindings[2].should.equals(editObject.name)
        result.bindings[3].should.not.empty
        result.bindings[4].should.equals(editObject.id)
        done()
      }).catch(err => done(err))
    })
  })

  // add test which insert data to DB
  describe('#add()' , () => {
    it('should return a valid query', (done) => {
      const objCompany = {
        name: 'Kemmer, Wintheiser and Jakubowski',
        address: 'Arizona street'
      }

      testObj.add(objCompany).then(result => {
        result.sql.should.equals(expectQuery.add)
        result.method.should.equals('insert')
        result.bindings[0].should.equals(objCompany.address)
        result.bindings[1].should.not.empty
        result.bindings[2].should.equals(objCompany.name)
        result.bindings[3].should.not.empty
        done()
      }).catch(err => done(err))
    })
  })

  // delete test which fill updated_at
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

    // delete test which real delete data from DB
    it('should return a valid query for forced delete', (done) => {
      const deleteQuery = 'delete from `companies` where `id` = ?'
      const deleteId = 12

      testObj.delete({'id': deleteId}, true).then(result => {
        result.sql.should.equals(deleteQuery)
        result.method.should.equals('del')
        result.bindings[0].should.equals(deleteId)
        done()
      }).catch(err => done(err))
    })
  })

  // isEqual test which return value is true
  describe('#isEqual()' , () => {
    it('should return tru value from comparison', () => {
      const companyObj = {
        name: 'Kemmer, Wintheiser and Jakubowski',
        address: 'Arizona street'
      }
      const otherObj = {
        name: 'Kemmer, Wintheiser and Jakubowski',
        address: 'Arizona street'
      }
      testObj.isEqual(companyObj,otherObj).should.equals(true)
    })
  })

  // isEqual test which return value is false
  describe('#isEqual()' , () => {
    it('should return tru value from comparison', () => {
      const companyObj = {
        name: 'Kemmer, Wintheiser and Jakubowski',
        address: 'Arizona street'
      }
      const otherObj = {
        name: 'Kemmer, Wintheiser and Jakubowski',
        address: 'California street'
      }
      testObj.isEqual(companyObj,otherObj).should.equals(false)
    })
  })

  // isNotEqual test inverse of isEqual which return value is true
  describe('#isNotEqual()' , () => {
    it('should return false value from comparison', () => {
      const companyObj = {
        name: 'Kemmer, Wintheiser and Jakubowski',
        address: 'Arizona street'
      }
      const otherObj = {
        name: 'Kemmer, Wintheiser and Jakubowski',
        address: 'California street'
      }
      testObj.isNotEqual(companyObj,otherObj).should.equals(true)
    })
  })

  // isNotEqual test inverse of isEqual which return value is false
  describe('#isNotEqual()' , () => {
    it('should return false value from comparison', () => {
      const companyObj = {
        name: 'Kemmer, Wintheiser and Jakubowski',
        address: 'Arizona street'
      }
      const otherObj = {
        name: 'Kemmer, Wintheiser and Jakubowski',
        address: 'Arizona street'
      }
      testObj.isNotEqual(companyObj,otherObj).should.equals(false)
    })
  })
})

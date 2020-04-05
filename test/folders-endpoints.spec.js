//const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')

const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures')

describe('Folders Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })
app.set('db', db)

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('folders').truncate())

afterEach('cleanup',() => db('folders').truncate())

describe(`GET /api/folders`, () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })

context('Given there are folders in the database', () => {
const testFolders = makeFoldersArray()

    beforeEach('insert folders', () => {
      return db
        .into('folders')
        .insert(testFolders)
    })

    it('responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('/api/folders')
         .expect(200, testFolders)
     })

   })

   context(`Given an XSS attack article`, () => {
         const { maliciousFolder, expectedFolder } = makeMaliciousFolder()

         beforeEach('insert malicious folder', () => {
           return db
             .into('folders')
             .insert([ maliciousFolder ])
         })

         it('removes XSS attack content', () => {
           return supertest(app)
             .get(`/api/folders`)
             .expect(200)
             .expect(res => {
               expect(res.body[0].name).to.eql(expectedFolder.name)
               //expect(res.body[0].content).to.eql(expectedArticle.content)
             })
         })
       })

})

describe(`GET /api/folders/:folder_id`, () => {
  context(`Given no folders`, () => {
    it(`responds with 404`, () => {
      const folderid = 123456
      return supertest(app)
        .get(`/api/folders/${folderid}`)
        .expect(404, { error: { message: `Folder doesn't exist` } })
    })
  })

  context('Given there are folders in the database', () => {
    const testFolders = makeFoldersArray()

    beforeEach('insert folders', () => {
      return db
        .into('folders')
        .insert(testFolders)
    })

    it('responds with 200 and the specified folder', () => {
      const folderid = 3
      const expectedFolder = testFolders[folderid - 1]
      return supertest(app)
        .get(`/api/folders/${folderid}`)
        .expect(200, expectedFolder)
    })
  })

  context(`Given an XSS attack folder`, () => {
        const { maliciousFolder, expectedFolder } = makeMaliciousFolder()

        beforeEach('insert malicious folder', () => {
          return db
            .into('folders')
            .insert([ maliciousFolder ])
        })

        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/folders/${maliciousFolder.id}`)
            .expect(200)
            .expect(res => {
              expect(res.body.name).to.eql(expectedFolder.name)
            //  expect(res.body.content).to.eql(expectedArticle.content)
            })
        })
})
})


describe(`POST /api/folders`, () => {
    it(`creates a folder, responding with 201 and the new folder`, function() {
      this.retries(3)
      const newFolder = {
        name: 'Test new folder',
      }
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name)
        //  expect(res.body.style).to.eql(newArticle.style)
        //  expect(res.body.content).to.eql(newArticle.content)
        //  expect(res.body).to.have.property('id')
        //  expect(res.headers.location).to.eql(`/articles/${res.body.id}`)
        //  const expected = new Date().toLocaleString()
        //  const actual = new Date(res.body.date_published).toLocaleString()
          expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        )
    })

    const requiredFields = ['name']

    requiredFields.forEach(field => {
      const newFolder = {
        name: 'Test new folder',

      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field]

        return supertest(app)
          .post('/api/folders')
          .send(newFolder)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    it('removes XSS attack content from response', () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder()
      return supertest(app)
        .post(`/api/folders`)
        .send(maliciousFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(expectedFolder.name)
        //  expect(res.body.content).to.eql(expectedArticle.content)
        })
    })
  })

  describe(`DELETE /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderid = 123456
        return supertest(app)
          .delete(`/api/folders/${folderid}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`folders`)
              .expect(expectedFolders)
          )
      })
    })
  })
})

//const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')

const { makeNotesArray, makeMaliciousNote } = require('./notes.fixtures')

describe('Notes Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })
app.set('db', db)

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('notes').truncate())

afterEach('cleanup',() => db('notes').truncate())

describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })

context('Given there are notes in the database', () => {
const testNotes = makeNotesArray()

    beforeEach('insert notes', () => {
      return db
        .into('notes')
        .insert(testNotes)
    })

    it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/api/notes')
         .expect(200, testNotes)
     })

   })

   context(`Given an XSS attack article`, () => {
         const { maliciousNote, expectedNote } = makeMaliciousNote()

         beforeEach('insert malicious note', () => {
           return db
             .into('notes')
             .insert([ maliciousNote ])
         })

         it('removes XSS attack content', () => {
           return supertest(app)
             .get(`/api/notes`)
             .expect(200)
             .expect(res => {
               expect(res.body[0].name).to.eql(expectedNote.name)
               expect(res.body[0].content).to.eql(expectedNote.content)
               expect(res.body[0].folderid).to.eql(expectedNote.folderid)
             })
         })
       })

})

describe(`GET /api/notes/:notes_id`, () => {
  context(`Given no notes`, () => {
    it(`responds with 404`, () => {
      const noteId = 123456
      return supertest(app)
        .get(`/api/notes/${noteId}`)
        .expect(404, { error: { message: `Note doesn't exist` } })
    })
  })

  context('Given there are notes in the database', () => {
    const testNotes = makeNotesArray()

    beforeEach('insert notes', () => {
      return db
        .into('notes')
        .insert(testNotes)
    })

    it('responds with 200 and the specified note', () => {
      const noteId = 3
      const expectedNote = testNotes[noteId - 1]
      return supertest(app)
        .get(`/api/notes/${noteId}`)
        .expect(200, expectedNote)
    })
  })

  context(`Given an XSS attack note`, () => {
        const { maliciousNote, expectedNote } = makeMaliciousNote()

        beforeEach('insert malicious note', () => {
          return db
            .into('notes')
            .insert([ maliciousNote ])
        })

        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/notes/${maliciousNote.id}`)
            .expect(200)
            .expect(res => {
              expect(res.body.name).to.eql(expectedNote.name)
             expect(res.body.content).to.eql(expectedNote.content)
             expect(res.body[0].folderid).to.eql(expectedNote.folderid)
            })
        })
})
})


describe(`POST /api/notes`, () => {
    it(`creates a note, responding with 201 and the new note`, function() {
      this.retries(3)
      const newNote = {
        name: 'Test new note',
      }
      return supertest(app)
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newNote.name)
        //  expect(res.body.style).to.eql(newArticle.style)
         expect(res.body.content).to.eql(newNote.content)
         expect(res.body.folderid).to.eql(expectedNote.folderid)
        //  expect(res.body).to.have.property('id')
        //  expect(res.headers.location).to.eql(`/articles/${res.body.id}`)
        //  const expected = new Date().toLocaleString()
        //  const actual = new Date(res.body.date_published).toLocaleString()
          expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/api/notes/${res.body.id}`)
            .expect(res.body)
        )
    })

    const requiredFields = ['name']

    requiredFields.forEach(field => {
      const newNote = {
        name: 'Test new note',

      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newNote[field]

        return supertest(app)
          .post('/api/notes')
          .send(newNote)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    it('removes XSS attack content from response', () => {
      const { maliciousNote, expectedNote } = makeMaliciousNote()
      return supertest(app)
        .post(`/api/notes`)
        .send(maliciousNote)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(expectedNote.name)
          expect(res.body.content).to.eql(expectedNote.content)
          expect(res.body.folderid).to.eql(expectedNote.folderid)
        })
    })
  })

  describe(`DELETE /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456
        return supertest(app)
          .delete(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `Note doesn't exist` } })
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testNotes)
      })

      it('responds with 204 and removes the note', () => {
        const idToRemove = 2
        const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`notes`)
              .expect(expectedNotes)
          )
      })
    })
  })
})

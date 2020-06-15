import { Repo } from '../../src/singletons'
import {
    Book,
    SpecKit,
} from '../spek-kit'
import { save } from '../..'
import * as FirebaseAdmin from 'firebase-admin'

describe('Repo', () => {
    const scope = SpecKit.prepareScope()

    it('can filter by "startsWith" using single term', async (done) => {
        let books = await Repo.of(Book).all().filter(toy => toy.name.startsWith('Game')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(2)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()
        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['gc']))).not.toBeNull()

        done()
    })

    it('can filter by "startsWith" using multiple terms', async (done) => {
        let books = await Repo.of(Book).all().filter(toy => toy.name.startsWith('gAme of')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(1)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()

        done()
    })

    it('can filter by "endsWith" using single term', async (done) => {
        let books = await Repo.of(Book).all().filter(toy => toy.name.endsWith('Thrones')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(1)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()
        done()
    })

    it('can filter by "endsWith" using multiple term', async (done) => {
        let books = await Repo.of(Book).all().filter(toy => toy.name.endsWith('of thrones')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(1)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()

        done()
    })

    beforeAll(SpecKit.setUpFixtures(scope, async (scope) => {
        let got = new Book()
        got.name = 'Game of Thrones'
        await save(got)

        let gc = new Book()
        gc.name = 'Game Club'
        await save(gc)

        scope.fixtures['got'] = {
            id: got.id,
            name: got.name,
        }
        scope.fixtures['gc'] = {
            id: gc.id,
            name: gc.name,
        }
    }))

    afterAll(SpecKit.runScopeAction(scope, async (scope) => {
        const Firestore = FirebaseAdmin.firestore()

        let books = await Firestore.collection('book').get()
        books.forEach(book => book.ref.delete())
    }))

})

function bookMatchFixture(book, fixture) {
    return book.id === fixture.id && book.name === fixture.name
}

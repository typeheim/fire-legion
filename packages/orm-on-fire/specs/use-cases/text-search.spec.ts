import {
    Book,
    SpecKit,
} from '../spek-kit'
import { Collection } from '../../index'
import * as FirebaseAdmin from 'firebase-admin'
import { TextIndexGenerator } from '../../src/Functions/TextIndexGenerator'

describe('Repo', () => {
    const scope = SpecKit.prepareScope()

    it('can filter by "startsWith" using single term', async (done) => {
        let books = await Collection.of(Book).all().filter(toy => toy.name.startsWith('Game')).get()
        expect(books).not.toBeNull()
        expect(books.length).toEqual(2)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()
        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['gc']))).not.toBeNull()

        done()
    })

    it('can filter by "startsWith" using multiple terms', async (done) => {
        let books = await Collection.of(Book).all().filter(toy => toy.name.startsWith('gAme of')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(1)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()

        done()
    })

    it('can filter by "endsWith" using single term', async (done) => {
        let books = await Collection.of(Book).all().filter(toy => toy.name.endsWith('Thrones')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(1)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()
        done()
    })

    it('can filter by "endsWith" using multiple term', async (done) => {
        let books = await Collection.of(Book).all().filter(toy => toy.name.endsWith('of thrones')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(1)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()

        done()
    })

    beforeAll(SpecKit.setUpFixtures(scope, async (scope, done) => {
        const Firestore = FirebaseAdmin.firestore()
        const generator = new TextIndexGenerator()

        scope.fixtures['got'] = {
            id: 'got',
            name: 'Game of Thrones',
        }
        scope.fixtures['gc'] = {
            id: 'gc',
            name: 'Game Club',
        }

        await Firestore.collection('book').doc(scope.fixtures['got'].id).set({
            name: scope.fixtures['got'].name,
            __ormOnFireMetadata: generator.generateIndex(scope.fixtures['got'], ['name']),
        })
        await Firestore.collection('book').doc(scope.fixtures['gc'].id).set({
            name: scope.fixtures['gc'].name,
            __ormOnFireMetadata: generator.generateIndex(scope.fixtures['gc'], ['name']),
        })

        Firestore.collection('book').onSnapshot(snapshot => {
            snapshot.docs.forEach(docSnapshot => {
                if (!docSnapshot.exists) {
                    return
                }
                let docData = docSnapshot.data()
                let oldMetadata = docData['__ormOnFireMetadata']
                let newMetadata = generator.generateIndex(docSnapshot.data(), ['name'])

                if (oldMetadata != newMetadata) {
                    docSnapshot.ref.update({
                        __ormOnFireMetadata: newMetadata,
                    })
                }
            })
        })

        done()
    }))

    afterAll(SpecKit.runScopeAction(scope, async (scope, done) => {
        const Firestore = FirebaseAdmin.firestore()

        let books = await Firestore.collection('book').get()
        books.forEach(book => book.ref.delete())

        done()
    }))

})

function bookMatchFixture(book, fixture) {
    return book.id === fixture.id && book.name === fixture.name
}

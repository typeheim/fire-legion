import {
    Book,
    SpecKit,
} from '../spek-kit'
import * as FirebaseAdmin from 'firebase-admin'
import { TextIndexGenerator } from '../../src/Functions/TextIndexGenerator'
import { Collection } from '../../src/Model'

describe('Repo', () => {
    const scope = SpecKit.prepareScope()

    it('can filter by "startsWith" using single term', async (done) => {
        let books = await Collection.of(Book).all().useIndex(toy => toy.name.startsWith('Game')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(2)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()
        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['gc']))).not.toBeNull()

        done()
    })

    it('can filter by "startsWith" using multiple terms', async (done) => {
        let books = await Collection.of(Book).all().useIndex(toy => toy.name.startsWith('gAme of')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(1)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()

        done()
    })

    it('can filter by "endsWith" using single term', async (done) => {
        let books = await Collection.of(Book).all().useIndex(toy => toy.name.endsWith('Thrones')).get()

        expect(books).not.toBeNull()
        expect(books.length).toEqual(1)

        expect(books.filter(book => bookMatchFixture(book, scope.fixtures['got']))).not.toBeNull()
        done()
    })

    it('can filter by "endsWith" using multiple term', async (done) => {
        let books = await Collection.of(Book).all().useIndex(toy => toy.name.endsWith('of thrones')).get()

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

        const indexCollection = `of-metadata/book/indexes`

        try {
            await Promise.all([
                // models
                Firestore.collection('book').doc(scope.fixtures['got'].id).set({
                    name: scope.fixtures['got'].name,
                }),
                Firestore.collection('book').doc(scope.fixtures['gc'].id).set({
                    name: scope.fixtures['gc'].name,
                }),
                // indexes
                Firestore.collection(indexCollection).doc(scope.fixtures['got'].id).set(generator.generateIndex(scope.fixtures['got'], ['name'])),
                Firestore.collection(indexCollection).doc(scope.fixtures['gc'].id).set(generator.generateIndex(scope.fixtures['gc'], ['name'])),
            ])
        } catch (error) {
            console.log(error)
        }


        scope['textIndexDestructor'] = Firestore.collection('book').onSnapshot(snapshot => {
            snapshot.docs.forEach(docSnapshot => {
                if (!docSnapshot.exists) {
                    return
                }

                let newMetadata = generator.generateIndex(docSnapshot.data(), ['name'])
                Firestore.collection(indexCollection).doc(docSnapshot.id).set(newMetadata).catch(error => console.log(error))
            })
        })

        done()
    }))

    afterAll(SpecKit.runScopeAction(scope, async (scope, done) => {
        scope['textIndexDestructor']()
        const Firestore = FirebaseAdmin.firestore()

        let books = await Firestore.collection('book').get()
        books.forEach(book => book.ref.delete())

        done()
    }))

})

function bookMatchFixture(book, fixture) {
    return book.id === fixture.id && book.name === fixture.name
}

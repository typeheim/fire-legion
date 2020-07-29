import * as FirebaseAdmin from 'firebase-admin'
import {
    Collection,
    save,
} from '../../index'
import {
    MapItem,
    SpecKit,
} from '../spek-kit'

describe('Collection', () => {
    const scope = SpecKit.prepareScope()

    it('can save document with map field', async (done) => {
        const Firestore = FirebaseAdmin.firestore()

        let item = new MapItem()
        item.id = 'new'
        item.map = {
            name: 'test',
            age: 4,
        }
        await save(item)

        // verification that linking entities doe not have side-effect of creating redundant entities
        let items = await Firestore.collection('map-item').get()
        expect(items.size).toEqual(3)

        let savedItemRef = await Firestore.collection('map-item').doc(item.id).get()
        let savedItem = savedItemRef.data()

        expect(savedItemRef.id).toEqual(item.id)
        expect(savedItem.map).toEqual(item.map)

        done()
    })

    it('can filter by doc with map field', async (done) => {
        const fixtureItem = scope.fixtures['first']
        let items = await Collection.of(MapItem).all().filter(filter => {
            filter.map.field('name').equal(fixtureItem.map.name)
        }).get()

        expect(items.length).toEqual(1)

        expect(items[0].id).toEqual(fixtureItem.id)
        expect(items[0].map).toEqual(fixtureItem.map)

        done()
    })

    beforeAll(SpecKit.setUpFixtures(scope, async (scope, done) => {
        let firstItem = new MapItem()
        firstItem.id = 'first'
        firstItem.map = {
            name: 'first',
            age: 1,
        }
        await save(firstItem)
        let secondItem = new MapItem()
        secondItem.id = 'second'
        secondItem.map = {
            name: 'second',
            age: 2,
        }
        await save(secondItem)

        scope.fixtures['first'] = firstItem
        scope.fixtures['second'] = secondItem

        done()
    }))

    afterAll(SpecKit.runScopeAction(scope, async (scope, done) => {
        const Firestore = FirebaseAdmin.firestore()

        let items = await Firestore.collection('map-item').get()
        items.forEach(item => item.ref.delete())

        done()
    }))
})



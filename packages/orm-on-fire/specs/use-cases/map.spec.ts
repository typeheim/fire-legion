import * as FirebaseAdmin from 'firebase-admin'
import {
    Collection,
    save,
} from '../../index'
import {
    MapItem,
    SpecKit,
    SubMap,
} from '../spek-kit'

describe('Collection', () => {
    const scope = SpecKit.prepareScope()

    it('can save document with map field', async () => {
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
    })

    it('can save document partially updating map field', async () => {
        const Firestore = FirebaseAdmin.firestore()

        let item = new MapItem()
        item.id = 'new2'
        item.map = {
            name: 'test',
            age: 4,
        }
        await save(item)

        let savedItem = await Collection.of(MapItem).one(item.id).get()
        savedItem.map.name = 'updated'
        await save(savedItem)

        let updatedItemRef = await Firestore.collection('map-item').doc(item.id).get()
        let updatedItem = updatedItemRef.data()

        expect(updatedItem.map).not.toBeNull()
        expect(updatedItem.map.name).toEqual('updated')
        expect(updatedItem.map.age).toEqual(4)
    })

    it('can save document with map list field', async () => {
        const Firestore = FirebaseAdmin.firestore()

        let item = new MapItem()
        item.id = 'new'
        item.map = {
            name: 'test',
            age: 4,
        }
        item.mapList = [
            {
                name: 'test',
                age: 4,
            },
            {
                name: 'test',
                age: 5,
            },
        ]
        await save(item)

        let savedItemRef = await Firestore.collection('map-item').doc(item.id).get()
        let savedItem = savedItemRef.data()

        expect(savedItemRef.id).toEqual(item.id)
        expect(savedItem.map).toEqual(item.map)
        expect(savedItem.mapList.length).toEqual(2)
    })

    it('has map type defined in class', async () => {
        const fixtureItem = scope.fixtures['first']
        let item = await Collection.of(MapItem).one('first').get()

        expect(item.id).toEqual(fixtureItem.id)
        expect(item.map).toEqual(fixtureItem.map)
        expect(item.map).toBeInstanceOf(SubMap)
        expect(item.mapList[0]).toBeInstanceOf(SubMap)
    })

    beforeAll(async () => {
        let firstItem = new MapItem()
        firstItem.id = 'first'
        firstItem.map = {
            name: 'first',
            age: 1,
        }
        firstItem.mapList = [
            {
                name: 'first',
                age: 1,
            },
        ]
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
    })

    afterAll(async () => {
        const Firestore = FirebaseAdmin.firestore()

        let items = await Firestore.collection('map-item').get()
        items.forEach(item => item.ref.delete())
    })
})



import * as FirebaseAdmin from 'firebase-admin'
import {
    Collection,
    save,
} from '../../index'
import {
    DateItem,
    SpecKit,
} from '../spek-kit'

describe('Collection', () => {
    const scope = SpecKit.prepareScope()

    it('can fetch documents with date fields', async (done) => {
        let fixtureItem = scope.fixtures['first'] as DateItem
        let fixtureDate = scope.fixtures['fixtureDate'] as Date
        let firstItem = await Collection.of(DateItem).one(fixtureItem.id).get()

        // custom and createdAt date should not be changed in fixture after save
        expect(firstItem.customDate).not.toBeNull()
        expect(firstItem.customDate.getTime()).toEqual(fixtureDate.getTime())

        done()
    })

    it('can save document with date fields', async (done) => {
        const Firestore = FirebaseAdmin.firestore()

        let item = new DateItem()
        item.id = 'new'

        await save(item)

        let savedDoc = await Firestore.collection('date-item').doc('new').get()
        let savedData = savedDoc.data()

        // created and updated dates must be set but custom date should be undefined
        expect(savedData.customDate).toBeUndefined()
        expect(savedData.cratedAt).not.toBeNull()
        expect(savedData.updatedAt).not.toBeNull()

        expect(item.customDate).toBeUndefined()
        expect(item.createdAt).not.toBeNull()
        expect(item.updatedAt).not.toBeNull()

        let savedCreatedDate = savedData.createdAt.toDate()
        let savedUpdatedDate = savedData.updatedAt.toDate()

        // dates in db and entity must match after save
        expect(item.createdAt).toEqual(savedCreatedDate)
        expect(item.updatedAt).toEqual(savedUpdatedDate)

        done()
    })

    it('update dates with UpdatedDateField decorator', async (done) => {
        let fixtureItem = scope.fixtures['first'] as DateItem
        let firstItem = await Collection.of(DateItem).one(fixtureItem.id).get()

        let date = new Date()
        firstItem.customDate = date

        await save(firstItem)

        // custom and createdAt date should not be changed in fixture after save
        expect(firstItem.customDate.getTime()).toEqual(date.getTime())
        expect(firstItem.createdAt.getTime()).toEqual(fixtureItem.createdAt.getTime())
        // updatedAt date should be regenerated at each save
        expect(firstItem.updatedAt.getTime()).toBeGreaterThan(fixtureItem.updatedAt.getTime())

        let updatedItem = await Collection.of(DateItem).one(fixtureItem.id).get()
        await save(updatedItem)

        // custom and createdAt date should not be changed in fixture after save
        expect(updatedItem.customDate.getTime()).toEqual(date.getTime())
        expect(updatedItem.createdAt.getTime()).toEqual(fixtureItem.createdAt.getTime())
        // updatedAt date should be regenerated at each save
        expect(updatedItem.updatedAt.getTime()).toBeGreaterThan(fixtureItem.updatedAt.getTime())
        expect(updatedItem.updatedAt.getTime()).toBeGreaterThan(firstItem.updatedAt.getTime())

        done()
    })


    beforeAll(SpecKit.setUpFixtures(scope, async (scope) => {
        let fixtureDate = new Date()

        let firstItem = new DateItem()
        firstItem.id = 'first'
        firstItem.customDate = fixtureDate
        await save(firstItem)

        let secondItem = new DateItem()
        secondItem.id = 'second'
        secondItem.customDate = fixtureDate
        await save(secondItem)

        scope.fixtures['fixtureDate'] = fixtureDate
        scope.fixtures['first'] = firstItem
        scope.fixtures['second'] = secondItem
    }))

    afterAll(SpecKit.runScopeAction(scope, async (scope) => {
        const Firestore = FirebaseAdmin.firestore()

        let items = await Firestore.collection('date-item').get()
        items.forEach(item => item.ref.delete())
    }))
})



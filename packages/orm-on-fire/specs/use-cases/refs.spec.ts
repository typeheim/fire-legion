import * as FirebaseAdmin from 'firebase-admin'
import {
    Collection,
    EntityNotSavedException,
    NullCollection,
    save,
} from '../../index'
import {
    Item,
    ItemOwner,
    ItemUser,
    SpecKit,
} from '../spek-kit'

describe('Collection', () => {
    const scope = SpecKit.prepareScope()

    it('can link multiple items', async (done) => {
        const Firestore = FirebaseAdmin.firestore()

        let item = await Collection.of(Item).one('item').get()
        let owner = await Collection.of(ItemOwner).one('owner').get()
        let user = await Collection.of(ItemUser).one('user').get()

        item.owner.link(owner)
        item.user.link(user)

        let items = await Firestore.collection('item').get()

        // verification that linking entities doe not have side-effect of creating redundant entities
        expect(items.size).toEqual(1)

        let ownerRef = await item.owner.get()
        let userRef = await item.user.get()

        expect(ownerRef.id).toEqual('owner')
        expect(userRef.id).toEqual('user')

        done()
    })

    it('can link multiple items to new entity', async (done) => {
        const Firestore = FirebaseAdmin.firestore()

        let item = new Item()
        let owner = await Collection.of(ItemOwner).one('owner').get()
        let user = await Collection.of(ItemUser).one('user').get()

        item.owner.link(owner)
        item.user.link(user)

        await save(item)

        let items = await Firestore.collection('item').get()
        // verification that linking entities doe not have side-effect of creating redundant entities
        expect(items.size).toEqual(2)

        let ownerRef = await item.owner.get()
        let userRef = await item.user.get()

        expect(ownerRef.id).toEqual('owner')
        expect(userRef.id).toEqual('user')

        done()
    })

    it('setup new entities with null collections throwing errors on any call', async (done) => {
        let item = new Item()

        expect(item.oldOwners).toBeInstanceOf(NullCollection)

        let exceptionFromOne
        try {
            item.oldOwners.one('')
        } catch (error) {
            exceptionFromOne = error
        }

        expect(exceptionFromOne).toBeInstanceOf(EntityNotSavedException)

        let exceptionFromAll
        try {
            item.oldOwners.all()
        } catch (error) {
            exceptionFromAll = error
        }

        expect(exceptionFromAll).toBeInstanceOf(EntityNotSavedException)

        let exceptionFromNew
        try {
            await item.oldOwners.new()
        } catch (error) {
            exceptionFromNew = error
        }

        expect(exceptionFromNew).toBeInstanceOf(EntityNotSavedException)

        let exceptionFromSave
        try {
            await item.oldOwners.save(new ItemOwner())
        } catch (error) {
            exceptionFromSave = error
        }

        expect(exceptionFromSave).toBeInstanceOf(EntityNotSavedException)

        let exceptionFromRemove
        try {
            await item.oldOwners.remove(new ItemOwner())
        } catch (error) {
            exceptionFromRemove = error
        }

        expect(exceptionFromRemove).toBeInstanceOf(EntityNotSavedException)

        let exceptionFromChanges
        try {
            await item.oldOwners.remove(new ItemOwner())
        } catch (error) {
            exceptionFromChanges = error
        }

        expect(exceptionFromChanges).toBeInstanceOf(EntityNotSavedException)

        done()
    })


    it('can refresh null collections after save', async (done) => {
        const Firestore = FirebaseAdmin.firestore()

        let item = new Item()

        expect(item.oldOwners).toBeInstanceOf(NullCollection)

        await save(item)

        expect(item.oldOwners).toBeInstanceOf(Collection)

        let oldItemOwner = new ItemOwner()
        oldItemOwner.id = 'tomas'
        await item.oldOwners.save(oldItemOwner)

        let savedOldOwner = await item.oldOwners.one(oldItemOwner.id).get()

        // item should be saved to sub-collection
        expect(savedOldOwner).not.toBeUndefined()
        expect(savedOldOwner).not.toBeNull()
        expect(savedOldOwner.id).not.toBeUndefined()
        expect(savedOldOwner.id).toEqual(oldItemOwner.id)

        done()
    })

    beforeAll(SpecKit.setUpFixtures(scope, async (scope, done) => {
        let item = new Item()
        item.id = 'item'
        await save(item)

        let owner = new ItemOwner()
        owner.id = 'owner'
        await save(owner)

        let user = new ItemUser()
        user.id = 'user'
        await save(user)

        done()
    }))

    afterAll(SpecKit.runScopeAction(scope, async (scope, done) => {
        const Firestore = FirebaseAdmin.firestore()

        let items = await Firestore.collection('item').get()
        items.forEach(item => item.ref.delete())

        let itemOwners = await Firestore.collection('item-owner').get()
        itemOwners.forEach(itemOwner => itemOwner.ref.delete())

        let itemUsers = await Firestore.collection('item-user').get()
        itemUsers.forEach(itemUser => itemUser.ref.delete())

        done()
    }))
})



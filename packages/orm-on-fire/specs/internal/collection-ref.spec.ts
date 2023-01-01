import { OrmOnFire } from '../../index'
import { CollectionReference } from '../../src/Persistence/CollectionReference'
import * as FirebaseAdmin from 'firebase-admin'
import { SpecKit } from '../spek-kit'
import { DestroyEvent } from '@typeheim/fire-rx'
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
} from 'firebase/firestore'

describe('CollectionReference', () => {
    const Connection = OrmOnFire
    const ConnectionDriver = OrmOnFire.driver
    const CollectionName = 'internal'

    it('can fetch doc', async () => {
        const collectionRef = doc(ConnectionDriver, CollectionName, 'first')

        const get = await getDoc(collectionRef)
        const docs = get.data()

        console.log('native', docs)

        // changes should include only changes simple field
        expect(docs).toEqual({ name: 'Ben' })
    })

    it('can fetch doc', async () => {
        const collectionRef = new CollectionReference(Connection, CollectionName)

        const get = await collectionRef.get({})
        const docs = get.docs.map(doc => doc.data())

        console.log(docs)

        // changes should include only changes simple field
        expect(docs.length).toEqual(2)
    })

    it('can subscribe to doc changes', async () => {
        const collectionRef = new CollectionReference(Connection, CollectionName)

        const changesStream = collectionRef.snapshot({})
        const get = await changesStream
        const docs = get.docs.map(doc => doc.data())

        console.log(docs)

        changesStream.complete()

        // changes should include only changes simple field
        expect(docs.length).toEqual(2)
    })

    beforeAll(async () => {
        const internalCollection = collection(ConnectionDriver, CollectionName)
        await setDoc(doc(internalCollection, `first`),{
                name: 'Ben',
        })
        await setDoc(doc(internalCollection, `second`),{
            name: 'Alex',
        })
    })

    afterAll(async () => {
        const internalCollection = collection(ConnectionDriver, CollectionName)
        await deleteDoc(doc(internalCollection, `first`))
        await deleteDoc(doc(internalCollection, `second`) )
    })
})



import * as FirebaseAdmin from 'firebase-admin'
import {
    Animal,
    AnimalTypes,
    Car,
    Engine,
    SpecKit,
} from '../spek-kit'
import {
    Collection,
    remove,
    save,
} from '../../index'

describe('Repo', () => {
    const scope = SpecKit.prepareScope()

    it('can save updates', async (done) => {
        let boomer = await Collection.of(Car).one('camry').get()

        boomer.name = 'Camryy'

        let result = await Collection.of(Car).save(boomer)
        expect(result).not.toBeNull()

        let snapshot = await FirebaseAdmin.firestore().collection('car').doc('camry').get()
        let camryData = snapshot.data()
        expect(camryData.name).toEqual('Camryy')
        // ensure repo updates specified fields and do not change existing
        expect(camryData.mileage).toEqual(scope.fixtures.camry.mileage)

        done()
    })

    it('can remove docs', async (done) => {
        let tesla = await Collection.of(Car).one('tesla').get()

        let result = await Collection.of(Car).remove(tesla)
        expect(result).not.toBeNull()

        let snapshot = await FirebaseAdmin.firestore().collection('car').doc('tesla').get()
        expect(snapshot.exists).toBeFalsy()

        done()
    })

    it('can remove docs by operator', async (done) => {
        let tesla = await Collection.of(Car).new()

        let result = remove(tesla)
        expect(result).not.toBeNull()

        let snapshot = await FirebaseAdmin.firestore().collection('car').doc('tesla').get()
        expect(snapshot.exists).toBeFalsy()

        done()
    })

    it('can create new doc', async (done) => {
        const repo = Collection.of(Car)

        let car = await repo.new()
        let snapshotOfNew = await FirebaseAdmin.firestore().collection('car').doc(car.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()

        done()
    })

    it('can create new doc with default values', async (done) => {
        const repo = Collection.of(Engine)

        let engine = await repo.new()
        let snapshotOfNew = await FirebaseAdmin.firestore().collection('engine').doc(engine.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()
        expect(snapshotOfNew.data().fuelType).toEqual('gas')

        done()
    })

    it('can save plain entity', async (done) => {
        const repo = Collection.of(Car)
        let car = new Car()
        expect(car.engine).not.toBeNull()

        await repo.save(car)

        let snapshotOfNew = await FirebaseAdmin.firestore().collection('car').doc(car.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()

        done()
    })


    it('can save plain entity with operator', async (done) => {
        let car = new Car()
        await save(car)

        let snapshotOfNew = await FirebaseAdmin.firestore().collection('car').doc(car.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()

        done()
    })

    it('can populate default values on save', async (done) => {
        let car = new Animal()
        await save(car)

        let snapshotOfNew = await FirebaseAdmin.firestore().collection('animal').doc(car.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()

        let record = snapshotOfNew.data()
        // ORM must save default values
        expect(record?.type).toEqual(AnimalTypes.Mammal)
        expect(record?.age).toEqual(1)
        expect(record?.metadata).toEqual({
            region: 'earth',
        })
        // fields that ain't orm fields should not be saved
        expect(record?.virtualField).toBeUndefined()

        done()
    })

    it('can save new record with id and update it', async (done) => {
        const repo = Collection.of(Car)
        let tucson = await repo.new('tucson')
        let snapshotOfNew = await FirebaseAdmin.firestore().collection('car').doc(tucson.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()

        tucson.id = 'tucson'
        tucson.name = 'Tucson'
        tucson.mileage = 500

        let result = await repo.save(tucson)
        expect(result).not.toBeNull()

        let snapshot = await FirebaseAdmin.firestore().collection('car').doc('tucson').get()
        let tucsonData = snapshot.data()
        expect(tucsonData.name).toEqual('Tucson')
        expect(tucsonData.mileage).toEqual(500)

        done()
    })

    beforeAll(SpecKit.setUpFixtures(scope, async (scope, done) => {
        const Firestore = FirebaseAdmin.firestore()

        let camry = {
            name: 'Camry',
            mileage: 0,
        }
        await Firestore.collection('car').doc('camry').set(camry)
        scope.fixtures['camry'] = camry

        let tesla = {
            name: 'Tesla',
            mileage: 100,
        }
        await Firestore.collection('car').doc('tesla').set(tesla)
        scope.fixtures['car'] = tesla

        done()
    }))


    afterAll(SpecKit.runScopeAction(scope, async (scope, done) => {
        const Firestore = FirebaseAdmin.firestore()

        let cars = await Firestore.collection('car').get()
        cars.forEach(carRef => {
            carRef.ref.delete()
        })

        done()
    }))
})



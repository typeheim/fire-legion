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

    it('can save updates', async () => {
        let boomer = await Collection.of(Car).one('camry').get()

        boomer.name = 'Camryy'

        let result = await Collection.of(Car).save(boomer)
        expect(result).not.toBeNull()

        let snapshot = await FirebaseAdmin.firestore().collection('car').doc('camry').get()
        let camryData = snapshot.data()
        expect(camryData.name).toEqual('Camryy')
        // ensure repo updates specified fields and do not change existing
        expect(camryData.mileage).toEqual(scope.fixtures.camry.mileage)
    })

    it('can save without changes', async () => {
        let camry = await Collection.of(Car).one('camry').get()
        let result = await Collection.of(Car).save(camry)

        expect(result).toBeTruthy()
    })

    it('can remove docs', async () => {
        let tesla = await Collection.of(Car).one('tesla').get()

        let result = await Collection.of(Car).remove(tesla)
        expect(result).not.toBeNull()

        let snapshot = await FirebaseAdmin.firestore().collection('car').doc('tesla').get()
        expect(snapshot.exists).toBeFalsy()
    })

    it('can remove docs by operator', async () => {
        let tesla = await Collection.of(Car).new()

        let result = remove(tesla)
        expect(result).not.toBeNull()

        let snapshot = await FirebaseAdmin.firestore().collection('car').doc('tesla').get()
        expect(snapshot.exists).toBeFalsy()
    })

    it('can create new doc', async () => {
        const repo = Collection.of(Car)

        let car = await repo.new()
        let snapshotOfNew = await FirebaseAdmin.firestore().collection('car').doc(car.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()
    })

    it('can create new doc with default values', async () => {
        const repo = Collection.of(Engine)

        let engine = await repo.new()
        let snapshotOfNew = await FirebaseAdmin.firestore().collection('engine').doc(engine.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()
        expect(snapshotOfNew.data().fuelType).toEqual('gas')
    })

    it('can save plain entity', async () => {
        const repo = Collection.of(Car)
        let car = new Car()
        expect(car.engine).not.toBeNull()

        await repo.save(car)

        let snapshotOfNew = await FirebaseAdmin.firestore().collection('car').doc(car.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()
    })


    it('can save plain entity with operator', async () => {
        let car = new Car()
        await save(car)

        let snapshotOfNew = await FirebaseAdmin.firestore().collection('car').doc(car.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()
    })

    it('can populate default values on save', async () => {
        let animal = new Animal()
        await save(animal)

        let snapshotOfNew = await FirebaseAdmin.firestore().collection('animal').doc(animal.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()

        let record = snapshotOfNew.data()
        // ORM must save default values
        expect(record?.type).toEqual(AnimalTypes.Mammal)
        expect(record?.age).toEqual(1)
        expect(record?.isWild).toBeTruthy()
        expect(record?.hasWings).toBeFalsy()
        expect(record?.metadata).toEqual({
            region: 'earth',
        })
        // fields that ain't orm fields should not be saved
        expect(record?.virtualField).toBeUndefined()
    })

    it('can crate and update array fields using the same entity', async () => {
        let animal = new Animal()
        animal.tags = [
            'bird',
        ]
        await save(animal)

        let snapshotOfNew = await FirebaseAdmin.firestore().collection('animal').doc(animal.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()

        let record = snapshotOfNew.data()
        // ORM must save default values
        expect(record?.type).toEqual(AnimalTypes.Mammal)
        expect(record?.age).toEqual(1)
        expect(record?.isWild).toBeTruthy()
        expect(record?.hasWings).toBeFalsy()
        expect(record?.metadata).toEqual({
            region: 'earth',
        })
        expect(record?.tags).toEqual([
            'bird',
        ])
        // fields that ain't orm fields should not be saved
        expect(record?.virtualField).toBeUndefined()

        animal.tags = [
            'bird',
            'owl',
        ]
        await save(animal)

        let snapshotOfUpdated = await FirebaseAdmin.firestore().collection('animal').doc(animal.id).get()
        expect(snapshotOfUpdated.exists).toBeTruthy()

        let updatedRecord = snapshotOfUpdated.data()
        // ORM must save default values
        expect(updatedRecord?.type).toEqual(AnimalTypes.Mammal)
        expect(updatedRecord?.age).toEqual(1)
        expect(updatedRecord?.isWild).toBeTruthy()
        expect(updatedRecord?.hasWings).toBeFalsy()
        expect(updatedRecord?.metadata).toEqual({
            region: 'earth',
        })
        expect(updatedRecord?.tags).toEqual([
            'bird',
            'owl',
        ])
        // fields that ain't orm fields should not be saved
        expect(updatedRecord?.virtualField).toBeUndefined()
    })

    it('can crate and update array fields using different entity objects', async () => {
        let animal = new Animal()
        animal.tags = [
            'bird',
        ]
        await save(animal)

        animal = await Collection.of(Animal).one(animal.id).get()

        animal.tags = [
            'bird',
            'owl',
        ]
        await save(animal)

        let snapshotOfUpdated = await FirebaseAdmin.firestore().collection('animal').doc(animal.id).get()
        expect(snapshotOfUpdated.exists).toBeTruthy()

        let updatedRecord = snapshotOfUpdated.data()
        // ORM must save default values
        expect(updatedRecord?.type).toEqual(AnimalTypes.Mammal)
        expect(updatedRecord?.age).toEqual(1)
        expect(updatedRecord?.isWild).toBeTruthy()
        expect(updatedRecord?.hasWings).toBeFalsy()
        expect(updatedRecord?.metadata).toEqual({
            region: 'earth',
        })
        expect(updatedRecord?.tags).toEqual([
            'bird',
            'owl',
        ])
        // fields that ain't orm fields should not be saved
        expect(updatedRecord?.virtualField).toBeUndefined()
    })

    it('can crate and update record fields using different entity objects', async () => {
        let animal = new Animal()
        animal.nestedTags = {
            type: [
                'bird',
            ],
            names: [
                'sparky',
            ],
        }
        await save(animal)

        animal = await Collection.of(Animal).one(animal.id).get()

        animal.nestedTags.names.push('lo')
        await save(animal)

        let snapshotOfUpdated = await FirebaseAdmin.firestore().collection('animal').doc(animal.id).get()
        expect(snapshotOfUpdated.exists).toBeTruthy()

        let updatedRecord = snapshotOfUpdated.data()
        // ORM must save default values
        expect(updatedRecord?.type).toEqual(AnimalTypes.Mammal)
        expect(updatedRecord?.age).toEqual(1)
        expect(updatedRecord?.isWild).toBeTruthy()
        expect(updatedRecord?.hasWings).toBeFalsy()
        expect(updatedRecord?.metadata).toEqual({
            region: 'earth',
        })
        expect(updatedRecord?.nestedTags).toEqual({
            type: [
                'bird',
            ],
            names: [
                'sparky',
                'lo',
            ],
        })
        // fields that ain't orm fields should not be saved
        expect(updatedRecord?.virtualField).toBeUndefined()
    })

    it('can populate default values on create', async () => {
        let animal = await Collection.of(Animal).new()

        let snapshotOfNew = await FirebaseAdmin.firestore().collection('animal').doc(animal.id).get()
        expect(snapshotOfNew.exists).toBeTruthy()

        let record = snapshotOfNew.data()
        // ORM must save default values
        expect(record?.type).toEqual(AnimalTypes.Mammal)
        expect(record?.age).toEqual(1)
        expect(record?.isWild).toBeTruthy()
        expect(record?.hasWings).toBeFalsy()
        expect(record?.metadata).toEqual({
            region: 'earth',
        })
        // fields that ain't orm fields should not be saved
        expect(record?.virtualField).toBeUndefined()
    })

    it('can update default values', async () => {
        let animal = await Collection.of(Animal).new()

        animal.type = AnimalTypes.Bird
        animal.age = 10

        animal.isWild = false
        animal.hasWings = true

        animal.metadata = {
            region: 'Europe',
            country: 'Ukraine',
        }

        await Collection.of(Animal).save(animal)

        let snapshotOfUpdated = await FirebaseAdmin.firestore().collection('animal').doc(animal.id).get()
        expect(snapshotOfUpdated.exists).toBeTruthy()

        let record = snapshotOfUpdated.data()
        // ORM must save default values
        expect(record?.type).toEqual(AnimalTypes.Bird)
        expect(record?.age).toEqual(10)
        expect(record?.isWild).toBeFalsy()
        expect(record?.hasWings).toBeTruthy()
        expect(record?.metadata).toEqual({
            region: 'Europe',
            country: 'Ukraine',
        })
        // fields that ain't orm fields should not be saved
        expect(record?.virtualField).toBeUndefined()


        animal.isWild = true
        animal.hasWings = false


        await Collection.of(Animal).save(animal)

        let newSnapshotOfUpdated = await FirebaseAdmin.firestore().collection('animal').doc(animal.id).get()
        expect(newSnapshotOfUpdated.exists).toBeTruthy()

        let newRecord = newSnapshotOfUpdated.data()
        expect(newRecord?.isWild).toBeTruthy()
        expect(newRecord?.hasWings).toBeFalsy()
    })

    it('can save new record with id and update it', async () => {
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
    })

    beforeAll(async () => {
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
    })


    afterAll(async () => {
        const Firestore = FirebaseAdmin.firestore()

        let cars = await Firestore.collection('car').get()
        let tasks = []

        cars.forEach(carRef => {
            tasks.push(carRef.ref.delete())
        })

        await Promise.all(tasks)
    })
})



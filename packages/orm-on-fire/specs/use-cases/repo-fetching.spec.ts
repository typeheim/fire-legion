import * as FirebaseAdmin from 'firebase-admin'
import { Collection } from '../../index'
import {
    Dog,
    Owner,
    SpecKit,
    Toy,
} from '../spek-kit'
import { Reference } from '../../src/Model'
import { DestroyEvent } from '@typeheim/fire-rx'

describe('Repo', () => {
    const scope = SpecKit.prepareScope()
    const destroyEvent = new DestroyEvent()

    it('can get one document async', async () => {
        let boomer = await Collection.of(Dog).one('boomer').get()
        const boomerFixture = scope.fixtures.boomer

        expect(boomer).not.toBeNull()
        expect(boomer.name).toEqual(boomerFixture.name)
        expect(boomer.age).toEqual(boomerFixture.age)
    })

    it('can provide subscription of one document', async () => {
        Collection.of(Dog).one('boomer').get().subscribe(boomer => {
            const boomerFixture = scope.fixtures.boomer

            expect(boomer).not.toBeNull()
            expect(boomer.name).toEqual(boomerFixture.name)
            expect(boomer.age).toEqual(boomerFixture.age)
            expect(boomer.owner).not.toBeNull()
            expect(boomer.owner.constructor.name).toEqual('Reference')
        })
    })

    it('can get one doc with ref', async () => {
        let sparky = await Collection.of(Dog).one('sparky').get()
        const sparkyFixture = scope.fixtures.sparky

        expect(sparky).not.toBeNull()
        expect(sparky.name).toEqual(sparkyFixture.name)
        expect(sparky.age).toEqual(sparkyFixture.age)

        expect(sparky.owner).not.toBeNull()

        const benFixture = scope.fixtures.ben
        let sparkyOwner = await sparky.owner.get()

        expect(sparkyOwner).not.toBeNull()
        expect(sparkyOwner.name).toEqual(benFixture.name)
    })

    it('can link entities', async () => {
        let boomer = await Collection.of(Dog).one('boomer').get()
        let ben = await Collection.of(Owner).one('ben').get()

        await boomer.owner.link(ben)

        let boomerWithOwner = await Collection.of(Dog).one('boomer').get()
        let owner = await boomerWithOwner.owner.get()

        expect(owner).not.toBeNull()
        expect(owner.name).toEqual(scope.fixtures.ben.name)
    })


    it('can get all async', async () => {
        let dogs = await Collection.of(Dog).all().get()

        expect(dogs).not.toBeNull()
        expect(dogs.length).toEqual(3)
        dogs.forEach((dog: Dog) => {
            expect(dog).toBeInstanceOf(Dog)

            let fixture = scope.fixtures[dog.id]
            expect(dog.name).toEqual(fixture.name)
            expect(dog.age).toEqual(fixture.age)
        })
    })

    it('can get all as ids', async () => {
        let dogs = await Collection.of(Dog).all().asIds().get()

        expect(dogs).not.toBeNull()
        expect(dogs.length).toEqual(3)

        let fixtureIds = [
            'sparky',
            'boomer',
            'lex',
        ]
        expect(fixtureIds.sort()).toEqual(dogs.sort())
    })

    it('can populate sub-collections', async () => {
        let boomer = await Collection.of(Dog).one('boomer').get()

        expect(boomer.toys).not.toBeNull()

        let toysCount = 0
        await boomer.toys.forEach(toy => {
            expect(toy).toBeInstanceOf(Toy)
            // small hack - id is equal type in fixtures
            expect(toy.type).toEqual(toy.id)
            toysCount++
        })

        expect(toysCount).toEqual(2)
    })

    it('can filter sub-collections', async () => {
        let boomer = await Collection.of(Dog).one('boomer').get()

        let filteredToys = await boomer.toys.filter(toy => toy.type.equal('bone')).get()
        expect(filteredToys).not.toBeNull()

        expect(filteredToys.length).toEqual(1)
        expect(filteredToys[0].type).toEqual('bone')
    })

    it('can fetch data from sub-collection', async () => {
        let toys = await Collection.of(Dog).one('boomer').collection(Toy).all().get()

        expect(toys).not.toBeNull()

        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('ball')
        expect(toys[1].id).toEqual('bone')
    })

    it('can fetch group', async () => {
        let toys = await Collection.groupOf(Toy).all().get()

        expect(toys).not.toBeNull()

        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('ball')
        expect(toys[1].id).toEqual('bone')
    })

    it('can filter group request', async () => {
        let toys = await Collection.groupOf(Toy).all().filter(toy => toy.type.equal('bone')).get()

        expect(toys).not.toBeNull()

        expect(toys.length).toEqual(1)
        expect(toys[0].id).toEqual('bone')
    })

    beforeAll(async () => {
        const Firestore = FirebaseAdmin.firestore()

        let ben = {
            name: 'Ben',
        }
        await Firestore.collection('owners').doc('ben').set(ben)
        scope.fixtures['ben'] = ben

        let alex = {
            name: 'Alex',
        }
        await Firestore.collection('owners').doc('alex').set(alex)
        scope.fixtures['alex'] = alex

        let sparky = {
            name: 'Sparky',
            age: 2,
            owner: await Firestore.collection('owners').doc('ben'),
        }
        await Firestore.collection('dog').doc('sparky').set(sparky)
        scope.fixtures['sparky'] = sparky

        let boomer = {
            name: 'Boomer',
            age: 5,
        }
        await Firestore.collection('dog').doc('boomer').set(boomer)
        scope.fixtures['boomer'] = boomer

        let lex = {
            name: 'Lex',
            age: 1,
        }
        await Firestore.collection('dog').doc('lex').set(lex)
        scope.fixtures['lex'] = lex

        let toysCollection = Firestore.collection('dog').doc('boomer').collection('toys')
        await toysCollection.doc('bone').set({ type: 'bone' })
        await toysCollection.doc('ball').set({ type: 'ball' })
    })

    afterAll(async () => {
        const Firestore = FirebaseAdmin.firestore()

        let dogs = await Firestore.collection('dog').get()
        dogs.forEach(dogRef => {
            dogRef.ref.delete()
        })

        let owners = await Firestore.collection('owners').get()
        owners.forEach(ownerRef => {
            ownerRef.ref.delete()
        })
    })
})



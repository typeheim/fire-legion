import * as FirebaseAdmin from 'firebase-admin'
import { Collection } from '../../src/singletons'
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

    it('can get one document async', async (done) => {
        let boomer = await Collection.of(Dog).one('boomer').get()
        const boomerFixture = scope.fixtures.boomer

        expect(boomer).not.toBeNull()
        expect(boomer.name).toEqual(boomerFixture.name)
        expect(boomer.age).toEqual(boomerFixture.age)

        done()
    })

    it('can provide subscription of one document', async (done) => {
        Collection.of(Dog).one('boomer').get().subscribe(boomer => {
            const boomerFixture = scope.fixtures.boomer

            expect(boomer).not.toBeNull()
            expect(boomer.name).toEqual(boomerFixture.name)
            expect(boomer.age).toEqual(boomerFixture.age)
            expect(boomer.owner).not.toBeNull()
            expect(boomer.owner.constructor.name).toEqual('Reference')

            done()
        })
    })

    it('can get one doc with ref', async (done) => {
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

        done()
    })

    it('can link entities', async (done) => {
        let boomer = await Collection.of(Dog).one('boomer').get()
        let ben = await Collection.of(Owner).one('ben').get()

        await boomer.owner.link(ben)

        let boomerWithOwner = await Collection.of(Dog).one('boomer').get()
        let owner = await boomerWithOwner.owner.get()

        expect(owner).not.toBeNull()
        expect(owner.name).toEqual(scope.fixtures.ben.name)

        done()
    })


    it('can get all async', async (done) => {
        let dogs = await Collection.of(Dog).all().get()

        expect(dogs).not.toBeNull()
        expect(dogs.length).toEqual(3)
        dogs.forEach((dog: Dog) => {
            expect(dog).toBeInstanceOf(Dog)

            let fixture = scope.fixtures[dog.id]
            expect(dog.name).toEqual(fixture.name)
            expect(dog.age).toEqual(fixture.age)
        })

        done()
    })

    it('can populate sub-collections', async (done) => {
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

        done()
    })

    it('can filter sub-collections', async (done) => {
        let boomer = await Collection.of(Dog).one('boomer').get()

        let filteredToys = await boomer.toys.filter(toy => toy.type.equal('bone')).get()
        expect(filteredToys).not.toBeNull()

        expect(filteredToys.length).toEqual(1)
        expect(filteredToys[0].type).toEqual('bone')

        done()
    })

    beforeAll(SpecKit.setUpFixtures(scope, async (scope) => {
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
    }))


    afterAll(SpecKit.runScopeAction(scope, async (scope) => {
        const Firestore = FirebaseAdmin.firestore()

        let dogs = await Firestore.collection('dog').get()
        dogs.forEach(dogRef => {
            dogRef.ref.delete()
        })

        let owners = await Firestore.collection('owners').get()
        owners.forEach(ownerRef => {
            ownerRef.ref.delete()
        })
    }))
})



import * as FirebaseAdmin from 'firebase-admin'
import { Repo } from '../../src/singletons'
import { SpecKit } from '../spek-kit'
import { Entity, Field, ID } from '../../src/Decorators'

describe('Repo', () => {
    const scope = SpecKit.prepareScope()

    it('can filter by "==" operator', async (done) => {
        let toys = await Repo.of(Toy).all().filter(toy => toy.name.equal(scope.fixtures.redCar.name)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(1)

        expect(toys[0].id).toEqual('redCar')

        done()
    })

    it('can filter by ">" operator', async (done) => {
        let toys = await Repo.of(Toy).all().filter(toy => toy.weight.greaterThen(15)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(3)

        expect(toys[0].id).toEqual('redCar')
        expect(toys[1].id).toEqual('bear')
        expect(toys[2].id).toEqual('copter')

        done()
    })

    it('can filter by "<" operator', async (done) => {
        let toys = await Repo.of(Toy).all().filter(toy => toy.weight.lessThen(20)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(1)

        expect(toys[0].id).toEqual('blueCar')

        done()
    })

    it('can filter by ">=" operator', async (done) => {
        let toys = await Repo.of(Toy).all().filter(toy => toy.weight.greaterThenOrEqual(25)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(3)

        expect(toys[0].id).toEqual('redCar')
        expect(toys[1].id).toEqual('bear')
        expect(toys[2].id).toEqual('copter')

        done()
    })

    it('can filter by "<=" operator', async (done) => {
        let toys = await Repo.of(Toy).all().filter(toy => toy.weight.lessThenOrEqual(25)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('blueCar')
        expect(toys[1].id).toEqual('redCar')

        done()
    })

    it('can filter by "in" operator', async (done) => {
        let toys = await Repo.of(Toy).all().filter(toy => toy.type.in(['construction', 'animal'])).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('bear')
        expect(toys[1].id).toEqual('blueCar')


        done()
    })

    it('can filter by "array-contains" operator', async (done) => {
        let toys = await Repo.of(Toy).all().filter(toy => toy.tags.contain('car')).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('blueCar')
        expect(toys[1].id).toEqual('redCar')


        done()
    })

    it('can limit', async (done) => {
        let toys = await Repo.of(Toy).all().limit(1).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(1)

        done()
    })

    it('can limit with filter', async (done) => {
        let toys = await Repo.of(Toy).all().filter(toy => toy.weight.greaterThen(15)).limit(2).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('redCar')
        expect(toys[1].id).toEqual('bear')

        done()
    })

    beforeAll(SpecKit.setUpFixtures(scope, async (scope) => {
        const Firestore = FirebaseAdmin.firestore()

        let fixtures = {
            redCar: {
                name: 'red car',
                weight: 25,
                type: 'electronic',
                tags: [
                    'toy',
                    'car',
                    'red'
                ]
            },
            blueCar: {
                name: 'blue car',
                weight: 15,
                type: 'construction',
                tags: [
                    'toy',
                    'car',
                    'blue'
                ]
            },
            bear: {
                name: 'bear',
                weight: 40,
                type: 'animal',
                tags: [
                    'toy',
                    'bear',
                    'brown'
                ]
            },
            copter: {
                name: 'copter',
                weight: 100,
                type: 'electronic',
                tags: [
                    'toy',
                    'helicopter',
                    'blue'
                ]
            },
        }

        for (let id in fixtures) {
            await Firestore.collection('toy').doc(id).set(fixtures[id])
        }

        scope.fixtures = fixtures
    }))


    afterAll(SpecKit.runScopeAction(scope, async (scope) => {
        const Firestore = FirebaseAdmin.firestore()

        let toys = await Firestore.collection('toy').get()
        toys.forEach(toy => toy.ref.delete())
    }))


})

@Entity()
class Toy {
    @ID() id: string
    @Field() name: string
    @Field() weight: number
    @Field() type: string
    @Field() tags: string[]
}

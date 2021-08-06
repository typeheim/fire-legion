import * as FirebaseAdmin from 'firebase-admin'
import { SpecKit } from '../spek-kit'
import {
    Collection,
    Entity,
    Field,
    ID,
    SortOrder,
} from '../../index'

describe('Repo', () => {
    const scope = SpecKit.prepareScope()

    it('can filter by "==" operator', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => toy.name.equal(scope.fixtures.redCar.name)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(1)

        expect(toys[0].id).toEqual('redCar')
    })

    it('can filter by "!=" operator', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => toy.type.notEqual('animal')).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(3)


        expect(toys[0].id).toEqual('blueCar')
        expect(toys[1].id).toEqual('copter')
        expect(toys[2].id).toEqual('redCar')
    })

    it('can filter by ">" operator', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => toy.weight.greaterThen(15)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(4)

        expect(toys[0].id).toEqual('redCar')
        expect(toys[1].id).toEqual('bear')
        expect(toys[2].id).toEqual('bear2')
        expect(toys[3].id).toEqual('copter')
    })

    it('can filter by "<" operator', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => toy.weight.lessThen(20)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(1)

        expect(toys[0].id).toEqual('blueCar')
    })

    it('can filter by ">=" operator', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => toy.weight.greaterThenOrEqual(25)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(4)

        expect(toys[0].id).toEqual('redCar')
        expect(toys[1].id).toEqual('bear')
        expect(toys[2].id).toEqual('bear2')
        expect(toys[3].id).toEqual('copter')
    })

    it('can filter by "<=" operator', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => toy.weight.lessThenOrEqual(25)).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('blueCar')
        expect(toys[1].id).toEqual('redCar')
    })

    it('can filter by "in" operator', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => toy.type.in(['construction', 'animal', 'bear2'])).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(3)

        expect(toys[0].id).toEqual('bear')
        expect(toys[1].id).toEqual('bear2')
        expect(toys[2].id).toEqual('blueCar')
    })
    it('can filter by "in" and greater than operator', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => {
            toy.type.in(['construction', 'animal', 'bear2'])
            toy.weight.greaterThen(30)
        }).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('bear')
        expect(toys[1].id).toEqual('bear2')
    })

    it('can filter by "array-contains" operator', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => toy.tags.contain('car')).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('blueCar')
        expect(toys[1].id).toEqual('redCar')
    })

    it('can filter by "id"', async () => {
        let toys = await Collection.of(Toy).all().filter(toy => toy.id.equal('redCar')).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(1)

        expect(toys[0].id).toEqual('redCar')
    })

    it('can limit', async () => {
        let toys = await Collection.of(Toy).all().limit(1).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(1)
    })


    it('can exclude ids', async () => {
        let toys = await Collection.of(Toy).all().exclude(['redCar', 'copter', 'bear2']).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('bear')
        expect(toys[1].id).toEqual('blueCar')
    })

    it('can exclude single id', async () => {
        let toys = await Collection.of(Toy).all().exclude('redCar').get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(4)

        expect(toys[0].id).toEqual('bear')
        expect(toys[1].id).toEqual('bear2')
        expect(toys[2].id).toEqual('blueCar')
        expect(toys[3].id).toEqual('copter')
    })

    it('can order by ascending', async () => {
        let toys = await Collection.of(Toy).all().orderBy('name').get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(5)

        expect(toys[0].id).toEqual('bear')
        expect(toys[1].id).toEqual('bear2')
        expect(toys[2].id).toEqual('blueCar')
        expect(toys[3].id).toEqual('copter')
        expect(toys[4].id).toEqual('redCar')
    })

    it('can order by descending', async () => {
        let toys = await Collection.of(Toy).all().orderBy('name', SortOrder.Descending).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(5)

        expect(toys[0].id).toEqual('redCar')
        expect(toys[1].id).toEqual('copter')
        expect(toys[2].id).toEqual('blueCar')
        expect(toys[3].id).toEqual('bear2')
        expect(toys[4].id).toEqual('bear')
    })

    it('can order by multiple fields', async () => {
        let toys = await Collection.of(Toy).all()
                                   .orderBy('name')
                                   .orderBy('weight', SortOrder.Descending).get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(5)

        expect(toys[0].id).toEqual('bear2')
        expect(toys[1].id).toEqual('bear')
        expect(toys[2].id).toEqual('blueCar')
        expect(toys[3].id).toEqual('copter')
        expect(toys[4].id).toEqual('redCar')
    })

    it('can order by and start from position', async () => {
        let toys = await Collection.of(Toy)
                                   .all()
                                   .orderBy('position')
                                   .startAt(3)
                                   .get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(3)

        expect(toys[0].id).toEqual('blueCar')
        expect(toys[1].id).toEqual('bear2')
        expect(toys[2].id).toEqual('redCar')
    })

    it('can order by and start after position', async () => {
        let toys = await Collection.of(Toy)
                                   .all()
                                   .orderBy('position')
                                   .startAfter(3)
                                   .get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('bear2')
        expect(toys[1].id).toEqual('redCar')
    })

    it('can order by and start from position by value', async () => {
        let toys = await Collection.of(Toy)
                                   .all()
                                   .orderBy('weight')
                                   .startAt(25)
                                   .get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(4)

        expect(toys[0].id).toEqual('redCar')
        expect(toys[1].id).toEqual('bear')
        expect(toys[2].id).toEqual('bear2')
        expect(toys[3].id).toEqual('copter')
    })

    it('can order by end at position', async () => {
        let toys = await Collection.of(Toy)
                                   .all()
                                   .orderBy('position')
                                   .endAt(3)
                                   .get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(3)

        expect(toys[0].id).toEqual('copter')
        expect(toys[1].id).toEqual('bear')
        expect(toys[2].id).toEqual('blueCar')
    })

    it('can order by end before position', async () => {
        let toys = await Collection.of(Toy)
                                   .all()
                                   .orderBy('position')
                                   .endBefore(3)
                                   .get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(2)

        expect(toys[0].id).toEqual('copter')
        expect(toys[1].id).toEqual('bear')
    })

    it('can order by position and fetch in range', async () => {
        let toys = await Collection.of(Toy)
                                   .all()
                                   .orderBy('position')
                                   .startAfter(1)
                                   .endAt(4)
                                   .get()

        expect(toys).not.toBeNull()
        expect(toys.length).toEqual(3)

        expect(toys[0].id).toEqual('bear')
        expect(toys[1].id).toEqual('blueCar')
        expect(toys[2].id).toEqual('bear2')
    })

    it('can use map operator', async () => {
        let toyName = await Collection.of(Toy).all().filter(toy => toy.name.equal(scope.fixtures.redCar.name)).map(toys => toys[0].name).get()

        expect(toyName).toEqual('red car')
    })

    beforeAll(async () => {
        const Firestore = FirebaseAdmin.firestore()

        let fixtures = {
            redCar: {
                name: 'red car',
                weight: 25,
                type: 'electronic',
                position: 5,
                tags: [
                    'toy',
                    'car',
                    'red',
                ],
            },
            blueCar: {
                name: 'blue car',
                weight: 15,
                type: 'construction',
                position: 3,
                tags: [
                    'toy',
                    'car',
                    'blue',
                ],
            },
            bear: {
                name: 'bear',
                weight: 40,
                type: 'animal',
                position: 2,
                tags: [
                    'toy',
                    'bear',
                    'brown',
                ],
            },
            bear2: {
                name: 'bear',
                weight: 90,
                type: 'animal',
                position: 4,
                tags: [
                    'toy',
                    'bear',
                    'brown',
                ],
            },
            copter: {
                name: 'copter',
                weight: 100,
                position: 1,
                type: 'electronic',
                tags: [
                    'toy',
                    'helicopter',
                    'blue',
                ],
            },
        }

        for (let id in fixtures) {
            await Firestore.collection('toy').doc(id).set(fixtures[id])
        }

        scope.fixtures = fixtures
    })

    afterAll(async () => {
        const Firestore = FirebaseAdmin.firestore()

        let toys = await Firestore.collection('toy').get()
        toys.forEach(toy => toy.ref.delete())
    })
})

@Entity()
class Toy {
    @ID() id: string
    @Field() name: string
    @Field() weight: number
    @Field() type: string
    @Field() position: number
    @Field() tags: string[]
}

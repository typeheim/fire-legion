import {
    CreatedDateField,
    Entity,
    Field,
    MapField,
    UpdatedDateField,
} from '../../index'
import { Metadata } from '../../src/singletons'
import { MutationTracker } from '../../src/Persistence/EntityManager'

describe('MutationTracker', () => {
    it('track singe primitive field changes', async (done) => {
        let entity = createEntity()
        let tracker = createTracker(entity)

        entity.name = 'new'

        let changes = tracker.getChanges(entity)

        // changes should include only changes simple field
        expect(changes).toEqual({
            /// temporary not tracking maps and arrays
            'aliases': [
                'a',
                'b',
                'c',
            ],
            'map': {
                'flag': true,
                'name': 'test',
            },
            'mapList': [
                {
                    'flag': true,
                    'name': 'test',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
            ],
            ///
            name: 'new',
        })

        done()
    })

    it('track multiple primitive field changes', async (done) => {
        let entity = createEntity()
        let tracker = createTracker(entity)

        entity.name = 'new'
        entity.email = 'new@new.com'

        let changes = tracker.getChanges(entity)

        // changes should include only changes simple field
        expect(changes).toEqual({
            /// temporary not tracking maps and arrays
            'aliases': [
                'a',
                'b',
                'c',
            ],
            'map': {
                'flag': true,
                'name': 'test',
            },
            'mapList': [
                {
                    'flag': true,
                    'name': 'test',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
            ],
            ///
            name: 'new',
            email: 'new@new.com',
        })

        done()
    })

    it('track array field changes', async (done) => {
        let entity = createEntity()
        let tracker = createTracker(entity)

        entity.mapList = []
        entity.aliases.push('new@new.com')

        let changes = tracker.getChanges(entity)

        // changes should include only changes simple field
        expect(changes).toEqual({
            /// temporary not tracking maps and arrays
            'map': {
                'flag': true,
                'name': 'test',
            },
            ///
            mapList: [],
            aliases: [
                'a',
                'b',
                'c',
                'new@new.com',
            ],
        })

        done()
    })

    it('track multiple primitive and date field changes', async (done) => {
        let entity = createEntity()
        let tracker = createTracker(entity)

        let newCreatedDate = new Date('12-12-2012')
        let newUpdatedDate = new Date('11-12-2012')

        entity.name = 'new'
        entity.email = 'new@new.com'
        entity.createdAt = newCreatedDate
        entity.updatedAt = newUpdatedDate

        let changes = tracker.getChanges(entity)

        // changes should include only changes simple field
        expect(changes).toEqual({
            /// temporary not tracking maps and arrays
            'aliases': [
                'a',
                'b',
                'c',
            ],
            'map': {
                'flag': true,
                'name': 'test',
            },
            'mapList': [
                {
                    'flag': true,
                    'name': 'test',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
            ],
            ///
            name: 'new',
            email: 'new@new.com',
            createdAt: newCreatedDate,
            updatedAt: newUpdatedDate,
        })

        done()
    })

    it('track multiple map field changes', async (done) => {
        let entity = createEntity()
        let tracker = createTracker(entity)

        entity.map.flag = false
        let changes = tracker.getChanges(entity)

        // changes should include whole map field
        expect(changes).toEqual({
            /// temporary not tracking maps and arrays
            'aliases': [
                'a',
                'b',
                'c',
            ],
            'mapList': [
                {
                    'flag': true,
                    'name': 'test',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
            ],
            ///

            'map': {
                'flag': false,
                'name': 'test',
            },
        })

        done()
    })

    it('track multiple map field changes in arrays', async (done) => {
        let entity = createEntity()
        let tracker = createTracker(entity)

        entity.mapList[0].name = 'false'
        let changes = tracker.getChanges(entity)

        // changes should include only changes of simple field
        expect(changes).toEqual({
            /// temporary not tracking maps and arrays
            'aliases': [
                'a',
                'b',
                'c',
            ],
            'map': {
                'flag': true,
                'name': 'test',
            },
            ///

            'mapList': [
                {
                    'flag': true,
                    'name': 'false',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
                {
                    'flag': true,
                    'name': 'test',
                },
            ],
        })

        done()
    })

    function createEntity(): Sample {
        let entity = new Sample()
        entity.name = 'test'
        entity.email = 'test@test.com'
        entity.aliases = [
            'a',
            'b',
            'c',
        ]
        entity.createdAt = new Date()
        entity.updatedAt = new Date()

        let sampleMap = new SampleMap()
        sampleMap.flag = true
        sampleMap.name = 'test'

        entity.map = sampleMap
        entity.mapList = [
            { ...sampleMap },
            { ...sampleMap },
            { ...sampleMap },
        ]

        return entity
    }

    function createTracker(entity: Sample): MutationTracker {
        let meta = Metadata.entity(Sample).get()

        return new MutationTracker(entity, meta.fields)
    }
})


class SampleMap {
    name: string
    flag: boolean = false
}

@Entity()
class Sample {
    @Field()
    name: string

    @Field()
    email: string

    @Field()
    aliases: string[]

    @CreatedDateField()
    createdAt: Date

    @UpdatedDateField()
    updatedAt: Date

    @MapField()
    map: SampleMap

    @MapField(SampleMap)
    mapList: SampleMap[]
}


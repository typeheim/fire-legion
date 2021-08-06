import {
    Entity,
    Field,
} from '../../src/Decorators/Entity'
import { Metadata } from '../../src/singletons'

describe('Entity metadata processing system', () => {
    it('save collection name as class name in lover case', () => {
        let metadata = Metadata.entity(User).get()
        expect(metadata.collection).toEqual('user')
    })

    it('add fields to metadata that marked with @Field() decorator', () => {
        let metadata = Metadata.entity(User).get()
        expect(metadata.fields.length).toEqual(2)
        expect(metadata.fields[0].name).toEqual('firstName')
        expect(metadata.fields[1].name).toEqual('lastName')
    })

    it('save collection name as class name in kebab case', () => {
        let metadata = Metadata.entity(UserProfile).get()
        expect(metadata.collection).toEqual('user-profile')
    })

    it('does not add any fields metadata if @Field() decorator not used', () => {
        let metadata = Metadata.entity(UserProfile).get()
        expect(metadata.fields.length).toEqual(0)
    })

    it('save collection name from metadata options of @Entity()', () => {
        let metadata = Metadata.entity(NotParsedName).get()
        expect(metadata.collection).toEqual('custom')
    })
})

@Entity()
class User {
    @Field()
    firstName

    @Field()
    lastName

    calculated
}

@Entity()
class UserProfile {
    calculated
}

@Entity({
    collection: 'custom',
})
class NotParsedName {

}

import {
    Aggregate,
    CollectionRef,
    CreatedDateField,
    DocRef,
    Entity,
    Field,
    ID,
    MapField,
    UpdatedDateField,
} from '../../../src/Decorators/Entity'
import { Reference } from '../../../src/Model/Reference'
import { Collection } from '../../../src/Model/Collection'


//
// Dogs collections
//

@Entity({
    collection: 'toys',
})
export class Toy {
    @ID()
    id: string

    @Field()
    type: string
}

@Entity({
    collection: 'owners',
})
export class Owner {
    @ID()
    id: string

    @Field()
    name: string
}

@Aggregate()
export class Dog {
    @ID()
    id: string

    @Field()
    name: string

    @Field()
    age: number

    @DocRef(Owner)
    owner: Reference<Owner>

    @CollectionRef(Toy)
    toys: Collection<Toy>
}

//
// User collections
//

@Entity()
export class User {
    @ID()
    id: string

    @Field()
    name: string
}


//
// Car collections
//

@Entity()
export class Engine {
    @ID()
    id: string

    @Field()
    fuelType: string = 'gas'
}


@Entity()
export class Car {
    @ID()
    id: string

    @Field()
    name: string

    @Field()
    mileage: number

    @DocRef(Engine)
    engine: number
}

@Entity()
export class Animal {
    @ID()
    id: string

    @Field()
    name: string

    @Field()
    type: string = AnimalTypes.Mammal

    @Field()
    age: number = 1

    @Field()
    isWild: boolean = true

    @Field()
    hasWings: boolean = false

    @Field()
    tags: string[]

    @Field()
    nestedTags: Record<string, string[]>

    @MapField()
    metadata: any = {
        region: 'earth',
    }

    virtualField = 25
}

export enum AnimalTypes {
    Mammal = 'mammal',
    Bird = 'bird',
    Fish = 'fish'
}

//
// Books collections
//

@Entity()
export class Book {
    @ID()
    id: string

    @Field()
    name: string
}


//
// Items
//

@Entity()
export class ItemOwner {
    @ID()
    id: string
}

@Entity()
export class ItemUser {
    @ID()
    id: string
}

@Entity()
export class Item {
    @ID()
    id: string

    @DocRef(ItemOwner)
    owner: Reference<ItemOwner>

    @DocRef(ItemUser)
    user: Reference<ItemOwner>

    @CollectionRef(ItemOwner)
    oldOwners: Collection<ItemOwner>
}

// MapItems

export class SubMap {
    name: string
    age: number
}

@Entity()
export class MapItem {
    @ID()
    id: string

    @MapField()
    map: SubMap

    @MapField(SubMap)
    mapList: SubMap[]
}

@Entity()
export class DateItem {
    @ID()
    id: string

    @CreatedDateField()
    createdAt: Date

    @UpdatedDateField()
    updatedAt: Date

    @Field()
    customDate: Date
}


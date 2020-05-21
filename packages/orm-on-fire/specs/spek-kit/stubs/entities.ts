import { Aggregate, CollectionRef, DocRef, Entity, Field, ID } from '../../../src/Decorators/Entity'
import { Reference } from '../../../src/Model/Reference'
import { Collection } from '../../../src/Model/Collection'


//
// Dogs collections
//

@Entity({
    collection: 'toys'
})
export class Toy {
    @ID()
    id: string

    @Field()
    type: string
}

@Entity({
    collection: 'owners'
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
export class Car {
    @ID()
    id: string

    @Field()
    name: string

    @Field()
    mileage: number
}

@Entity()
export class Engine {
    @ID()
    id: string

    @Field()
    fuelType: string = 'gas'
}

# Fire Legion
DDD framework to work with Firebase

Includes:
* ORM On Fire - Firestore ORM
* FireRx - RxJS extension that provides async capabilities

## ORM On Fire

Delightful Firestore ORM

```typescript
import { Aggregate, Entity, Collection, CollectionRef, ID, Field } from '@typeheim/orm-on-fire'

@Aggregate()
export class User {
    @ID() id: string

    @Field() firstName: string

    @Field() lastName: string

    @Field() status: string

    @CollectionRef(UserFile) files: Collection<UserFile>
}

@Entity({collection: 'user-files'})
export class UserFile {
    @ID() id: string

    @Field()
    name: string
}

const Users = Collection.of(User)

// with promise-like interface
let markus = await Users.one('markus').get()

// with Rx interface
Users.one('tom').get().subscribe((tom: User) => {
    tom.files.forEach((file: UserFile) => {
        // some cool stuff
    })
}) 
```

## FireRx

Want Rx.JS to work as promises? Here you go: 

```typescript
import { FireReplaySubject } from '@typeheim/fire-rx'

let subject = new FireReplaySubject<number>(1)

subject.next(5)
let value = await subject // 5

subject.next(6)
let nextValue = await subject // 6
```

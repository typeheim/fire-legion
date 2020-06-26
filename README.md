# Fire Legion
DDD framework for Firebase and RxJS based applications.

# Getting Started
Install package
```shell
yarn add @typeheim/fire-legion
//or
npm -i @typeheim/fire-legion
```

# ORMOnFire
ORMOnFire is a powerful Firestore ORM. 

## Installation
Setup ORMOnFire driver:
```typescript
// sample for Node.JS
FirebaseAdmin.initializeApp({
    credential: FirebaseAdmin.credential.cert('my.key.json'),
    databaseURL: "https://my-db.firebaseio.com",
})
OrmOnFire.driver = FirebaseAdmin.firestore()
```

## Easy entity declaration
```typescript
import { Agregate, Entity, Collection, CollectionRef, ID, Field, SearchField } from '@typeheim/orm-on-fire'

@Agregate()
export class User {
    @ID() id: string

    @SearchField() firstName: string

    @SearchField() lastName: string

    @Field() status: string

    @CollectionRef(UserFile) files: Collection<UserFile>
}

@Entity({ collection: 'user-files' })
export class UserFile {
    @ID() id: string

    @Field() name: string
}

export const UsersCollection = Collection.of(User)

//.......

// with promise-like interface
let markus = await UsersCollection.one('markus').get()

// with Rx interface
UsersCollection.one('tom').get().subscribe((tom: User) => {
    tom.files.forEach((file: UserFile) => {
        // some cool stuff
    })
}) 
```
[Read more...](packages/orm-on-fire/README.md)

# FireRx 

RxJS on steroids. Adds memory safety and garbage collection  features to work with subjects and subscriptions. 
Adds streams that behave both like subjects behave and promises to support async/await. 

## StatefulSubject
StatefulSubject extends ReplaySubject from RxJS and adds memory safety and garbage collection.
```typescript
import { StatefulSubject } from '@typeheim/fire-rx'

let subject = new StatefulSubject<number>(1)

subject.next(5) // emits to all subscriptions 5
subject.stop() // completes subject and unsubscribe all subscriptions
```

## StatefulStream
StatefulStream extends StatefulSubject and adds Promise interface so that you can use async/await operators on it.
```typescript
import { StatefulStream } from '@typeheim/fire-rx'

let subject = new StatefulStream<number>(1)

subject.next(5)  
await subject // returns 5

subject.next(6)
await subject // returns 6

subject.stop() // completes subject and unsubscribe all subscriptions
```
[Read more...](packages/fire-rx/README.md)

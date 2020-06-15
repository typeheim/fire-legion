# Fire Legion
DDD framework for Firebase and RxJS based applications.

# Getting Started
Install package
```shell
yarn add @typeheim/fire-legion
//or
npm -i @typeheim/fire-legion
```
Setup ORMOnFire driver:
```typescript
// sample for Node.JS
FirebaseAdmin.initializeApp({
    credential: FirebaseAdmin.credential.cert('my.key.json'),
    databaseURL: "https://my-db.firebaseio.com",
})
OrmOnFire.driver = FirebaseAdmin.firestore()
```

# ORMOnFire
ORMOnFire is a powerful Firestore ORM. 

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
```

## Simple data fetching 
```typescript
import { Collection } from '@typeheim/orm-on-fire'

// with promise-like interface
let markus = await Collection.of(User).one('markus').get()

// with Rx interface
Collection.of(User).one('tom').get().subscribe((tom: User) => {
    tom.files.forEach((file: UserFile) => {
        // some cool stuff
    })
}) 
```

## Powerful filtering
```typescript
import { Collection } from '@typeheim/orm-on-fire'
const UsersCollection = Collection.of(User)

// Search using regular Firesotre operators
let activeUsers = await UsersCollection.all().filter(user => user.status.equal('active')).get()

// Text index queries - required @SearchField() decorator for field
// Note: search is case-insensitive 
let usersStartsWithAlex = await UsersCollection.all().filter(user => user.firstName.startsWith('Alex')).get()
let usersEndsWithLex = await UsersCollection.all().filter(user => user.firstName.endsWith('lex')).get()
```

Support of filter scopes:
```typescript
class UserScope {
    static active() {
        return (user: EntityFilter<User>) => {
            user.status.equal(1)
        }
    }
}

let activeUsers = await UsersCollection.all().filter(UserScope.active()).get()
```

# FireRx 

RxJS on steroids. Makes subjects behave like promises to support async/await and adds new useful classes. 

## StatefulSubject
StatefulSubject extends ReplaySubject from RxJS and adds Promise interface so that you can use async/await operators on it.
```typescript
import { StatefulSubject } from '@typeheim/fire-rx'

let subject = new StatefulSubject<number>(1)

subject.next(5)
await subject // returns 5

subject.next(6)
await subject // returns 6
```

## ValueSubject
ValueSubject extends BehaviorSubject from RxJS and adds Promise interface so that you can use async/await operators on it.
```typescript
import { ValueSubject } from '@typeheim/fire-rx'

let subject = new ValueSubject<number>(0)

subject.next(5)
await subject // returns 5

subject.next(6)
await subject // returns 6
```

## ReactivePromise
ReactivePromise acts as a regular Promise but additionally let you use `subscribe` and `pipe` methods. ReactivePromise, like 
StatefulSubject, buffers resolved value and can distribute it to multiple subscribers. 
ReactivePromise is memory-safe and unsubscribe subscriptions once it's resolved. 

```typescript
import { ReactivePromise } from '@typeheim/fire-rx'

let promise = new ReactivePromise<number>()

promise.resolve(5)
await promise // returns 5
promise.subscribe(value => console.log(value)) // returns 5 

//..............

let promise = new ReactivePromise<number>((resolve, reject) => {
    resolve(5)
})

promise.subscribe(value => console.log(value)) // returns 5 
```

## SubscriptionsHub
SubscriptionsHub represents a hub of subscriptions that let you massively unsubscribe them at once. It might be useful to trigger
at object destruction to free resources
```typescript
import { SubscriptionsHub, StatefulSubject } from '@typeheim/fire-rx'

class Sample {
    protected hub: SubscriptionsHub = new SubscriptionsHub()
    
    doSomething() {
        let subject = new StatefulSubject<number>()
        
        this.hub.add(subject.subscribe(data => console.log(data)))
    }
    
    onDestroy() {
        this.hub.unsubscribe()
    }
}
```

## DestroyEvent
DestroyEvent is a special reactive class that servers as a destruction notifier and can be used in pair with Fire subjects or
with SubscriptionsHub

```typescript
import { DestroyEvent, SubscriptionsHub, StatefulSubject } from '@typeheim/fire-rx'

class Sample {
    protected destroyEvent: DestroyEvent = new DestroyEvent()
    protected hub: SubscriptionsHub = new SubscriptionsHub(this.destroyEvent)

    doSomething() {
        let subject = new StatefulSubject<number>()

        this.hub.add(subject.subscribe(data => console.log(data)))

        let anotherSubject = new StatefulSubject<number>()
        
        subject.until(this.destroyEvent).subscribe(data => console.log(data))
    }

    onDestroy() {
        this.destroyEvent.emit()
    }
}
```

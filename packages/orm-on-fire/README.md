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

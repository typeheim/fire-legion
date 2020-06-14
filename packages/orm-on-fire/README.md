# ORMOnFire
ORMOnFire is a powerful Firestore ORM. 

## Easy entity declaration
```typescript
import { Agregate, Entity, Collection, CollectionRef, ID, Field, TextField } from '@typeheim/orm-on-fire'

@Agregate()
export class User {
    @ID() id: string

    @TextField() firstName: string

    @TextField() lastName: string

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
const Users = Collection.of(User)

// regular Firesotre operators
let activeUsers = await Users.all().filter(user => user.status.equal('active')).get()

// text index queries 
let usersStartsWithAlex = await Users.all().filter(user => user.firstName.startsWith('Alex')).get() // case-sensitive search
let usersEndsWithLex = await Users.all().filter(user => user.firstName.endsWith('lex')).get() // case-sensitive search

// text matching(behaves like startsWith but case-insensitive)
let usersMatchResult = await Users.all().filter(user => user.firstName.match('aLex')).get() // case-insensitive search
```

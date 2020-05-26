# ORM On Fire
Firestore ORM

Easy entity declaration
```typescript
import { Agregate, Entity, Collection, CollectionRef, ID, Field } from '@typeheim/orm-on-fire'

@Agregate()
export class User {
    @ID() id: string

    @Field() firstName: string

    @Field() lastName: string

    @Field() status: string

    @CollectionRef(UserFile) files: Collection<UserFile>
}

@Entity({ collection: 'user-files' })
export class UserFile {
    @ID() id: string

    @Field()
    name: string
}
```

Simple data fetching 
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

Powerful filtering
```typescript
import { Repo } from '@typeheim/orm-on-fire'
const Users = Collection.of(User)

let activeUsers = await Users.all().filter(user => user.status.equal('active')).get()
```

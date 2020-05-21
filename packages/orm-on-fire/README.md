# ORM On Fire
Firestore ORM

Sample:
```typescript
import { Entity, Collection, CollectionRef, ID, Field, Repo } from '@typeheim/orm-on-fire'


@Entity()
export class User {
    @ID()
    id : string

    @Field()    
    firstName: string

    @Field()
    lastName: string

    @Collection()
    files: Collection<UserFile>
}
@Entity({collection: 'user-files'})
export class UserFile {
    @ID()
    id : string

    @Field()
    name: string
}

// with promise-like interface
let markus = await Repo.of(User).one('markus').get()

// with Rx interface
Repo.of(User).one('tom').get().subscribe((tom: User) => {
    tom.files.forEach((file: UserFile) => {
        // some cool stuff
    })
}) 

```

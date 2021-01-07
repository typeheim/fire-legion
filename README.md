# Fire Legion

DDD framework for Firebase applications.
<p>
    <a href="https://www.npmjs.com/package/@typeheim/fire-legion" target="_blank"><img src="https://img.shields.io/npm/v/@typeheim/fire-legion.svg" alt="NPM Version" /></a>
    <a href="https://app.buddy.works/typeheim/fire-legion/pipelines/pipeline/300564" target="_blank"><img src="https://app.buddy.works/typeheim/fire-legion/pipelines/pipeline/300564/badge.svg?token=aad32357cefae9d70b31d8b440fdf3f3d5d2a244a0412ff42ac294abbfc508f5" alt="Build Status" /></a>
    <a href="https://www.npmjs.com/package/@typeheim/fire-legion" target="_blank"><img src="https://img.shields.io/npm/l/@typeheim/fire-legion.svg" alt="Package License" /></a>
    <a href="https://discord.gg/dmMznp9" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

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
import {
    Agregate,
    Entity,
    Collection,
    CollectionRef,
    ID,
    Field
} from '@typeheim/orm-on-fire'

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

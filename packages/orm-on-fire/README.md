<p align="center">
    <h1>
        <span style="color: #E16232; font-weight: bold">ORM</span><span style="color: #FFBE64; font-weight: bold">OnFire</span>
    </h1>
    <img style="max-width: 100%" width="256" src="https://raw.githubusercontent.com/typeheim/fire-legion/72fd86c68b1d10d8d29c8d24004def09f63bbf79/packages/orm-on-fire/docs/orm-on-fire.svg"></img>
</p>
<p>
    <a href="https://www.npmjs.com/package/@typeheim/orm-on-fire" target="_blank"><img src="https://img.shields.io/npm/v/@typeheim/orm-on-fire.svg" alt="NPM Version" /></a>
    <a href="https://app.buddy.works/typeheim/fire-legion/pipelines/pipeline/300564" target="_blank"><img src="https://app.buddy.works/typeheim/fire-legion/pipelines/pipeline/300564/badge.svg?token=aad32357cefae9d70b31d8b440fdf3f3d5d2a244a0412ff42ac294abbfc508f5" alt="Build Status" /></a>
    <a href="https://www.npmjs.com/package/@typeheim/orm-on-fire" target="_blank"><img src="https://img.shields.io/npm/l/@typeheim/orm-on-fire.svg" alt="Package License" /></a>
    <a href="https://discord.gg/dmMznp9" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

ORMOnFire is a powerful Firestore ORM.

## Installation
Install package

```shell
yarn add @typeheim/orm-on-fire
//or
npm -i @typeheim/orm-on-fire
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

## Easy entity declaration

To define entity you need to use `@Entity` or `@Agregate` decorators for simple and nested collections. Note both
decorators will transform class name to kebab case - lowercase and split words with hyphens, like `UserFiles` <
=> `user-files`.

Then, each document field must be decorated with `@Field`, `@MapField`, `@CreatedDateField`, `@UpdatedDateField`
or `@DocRef`(for document references) decorators. Sub-collections can be referenced by `@CollectionRef` decorator.

```typescript
import {
    Agregate,
    Entity,
    Collection,
    CollectionRef,
    ID,
    Field,
    CreatedDateField,
    UpdatedDateField,
    MapField
} from '@typeheim/orm-on-fire'
import { CreatedDateField } from './Entity'

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

    @MapField() properties: FileProperties

    @CreatedDateField() createdAt: Date

    @UpdatedDateField() createdAt: Date
}

class FileProperties {
    type: "image" | "doc"
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

### Using firestore operators

```typescript
import { Collection } from '@typeheim/orm-on-fire'
const UsersCollection = Collection.of(User)

// Search using regular Firesotre operators
let activeUsers = await UsersCollection.all().filter(user => user.status.equal('active')).get()
let notActiveUsers = await UsersCollection.all().filter(user => user.status.notEqual('active')).get()
let adultUsers = await UsersCollection.all().filter(user => user.age.greaterThan(18)).get()
```

### Test index search

To use text index search you first need to add text index hook Firebase function to your Firebase functions list for
each colelction you want to be idndexed

```typescript
import { TextIndex } from '@typeheim/orm-on-fire'
import * as functions from 'firebase-functions'
import * as FirebaseAdmin from 'firebase-admin'

FirebaseAdmin.initializeApp()

export const generateUserIndex = TextIndex(functions, FirebaseAdmin).forCollection('users')
                                                     .fields(['name', 'text'])
                                                     .buildTrigger()
```

Official functions deployment
guide: [Get started: write, test, and deploy your first functions](https://firebase.google.com/docs/functions/get-started)

Once you deploy hooks, you can use index search as below:

```typescript
// Note: text index search is case-insensitive 
let usersStartsWithAlex = await UsersCollection.all().useIndex(user => user.firstName.startsWith('Alex')).get()
let usersEndsWithLex = await UsersCollection.all().useIndex(user => user.firstName.endsWith('lex')).get()
```
NOTE: for now text index won't work with collection group queries. Support coming in next releases.

## Filter scopes:

Commonly used filer conditions can be organized in named filter scopes for easy code reuse:

```typescript
class UserScope {
    static active() {
        return (user: EntityFilter<User>) => {
            user.status.equal(1)
        }
    }
}

// fetch all active users
let activeUsers = await UsersCollection.all().filter(UserScope.active()).get()
```

## Sub-collection queries:

For nested collections you don't need to fetch each document separately and can access required collection under
specific document ID:

```typescript
// fetch all PDF files from user suwth id "userId"
let userFiles = await UsersCollection.one('userId').collecction(UserFile).filter(UserFile.pdf()).get()
```

## Group collection queries:

ORMOnFire support easy declaration
of [collection groups](https://firebase.googleblog.com/2019/06/understanding-collection-group-queries.html) the same way
as for regular collections.

```typescript
// fetch all file attachments that exist in any collection and sub-collection
let attechments = await Collection.groupOf(Attachment).all().filter(Attachment.file()).get()
```

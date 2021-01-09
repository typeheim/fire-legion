<p align="center">
    <img style="max-width: 100%" width="1200" src="https://raw.githubusercontent.com/typeheim/fire-legion/46726290060f4631bb0fb10017bdf7954f7e21d9/packages/fire-legion/docs/fire-legion-logo.svg">
</p>
<p>
    <a href="https://www.npmjs.com/package/@typeheim/fire-legion" target="_blank"><img src="https://img.shields.io/npm/v/@typeheim/fire-legion.svg" alt="NPM Version" /></a>
    <a href="https://app.buddy.works/typeheim/fire-legion/pipelines/pipeline/300564" target="_blank"><img src="https://app.buddy.works/typeheim/fire-legion/pipelines/pipeline/300564/badge.svg?token=aad32357cefae9d70b31d8b440fdf3f3d5d2a244a0412ff42ac294abbfc508f5" alt="Build Status" /></a>
    <a href="https://www.npmjs.com/package/@typeheim/fire-legion" target="_blank"><img src="https://img.shields.io/npm/l/@typeheim/fire-legion.svg" alt="Package License" /></a>
    <a href="https://discord.gg/dmMznp9" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>
DDD framework for Firebase applications that includes ORMOnFire and FireAuth libraries.

# Getting Started

Install root package that adds all of the latest FireLegion packages to dependencies

```shell
yarn add @typeheim/fire-legion
//or
npm -i @typeheim/fire-legion
```

# ORMOnFire

ORMOnFire is a powerful Firestore ORM.

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
[Read more...](https://github.com/typeheim/fire-legion/tree/master/packages/orm-on-fire)

# FireAuth

FireAuth is Firebase auth library based on Rx principles.

```typescript
import { FireAuth, FireAuthSession, AuthProvidersList } from '@typeheim/fire-auth'

// through provider
FireAuth.throughProvider(AuthProvidersList.Google).signInWithPopup()

// using email/password flow
FireAuth.signIn(new PasswordAuth('email', 'password'))

// getting user object
FireAuthSession.userStream.subscribe(user => /*do your magick*/)

// gedding auth status
FireAuthSession.isLoggedInStream.subscribe(isLoggedIn => /*do your magick*/)

// gedding access token
FireAuthSession.accessTokenStream.subscribe(token => /*do your magick*/)
```
[Read more...](https://github.com/typeheim/fire-legion/tree/master/packages/fire-atuh)

<p align="center">
    <img style="max-width: 100%" width="1200" src="https://raw.githubusercontent.com/typeheim/fire-legion/46726290060f4631bb0fb10017bdf7954f7e21d9/packages/fire-auth/docs/fire-auth-logo.svg">
</p>
<p>
    <a href="https://www.npmjs.com/package/@typeheim/fire-auth" target="_blank"><img src="https://img.shields.io/npm/v/@typeheim/fire-auth.svg" alt="NPM Version" /></a>
    <a href="https://app.buddy.works/typeheim/fire-legion/pipelines/pipeline/300564" target="_blank"><img src="https://app.buddy.works/typeheim/fire-legion/pipelines/pipeline/300564/badge.svg?token=aad32357cefae9d70b31d8b440fdf3f3d5d2a244a0412ff42ac294abbfc508f5" alt="Build Status" /></a>
    <a href="https://www.npmjs.com/package/@typeheim/fire-auth" target="_blank"><img src="https://img.shields.io/npm/l/@typeheim/fire-auth.svg" alt="Package License" /></a>
    <a href="https://discord.gg/dmMznp9" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

FireAuth is Firebase auth library based on Rx principles.

## Installation

Install package:

```shell
yarn add @typeheim/fire-auth
//or
npm -i @typeheim/fire-auth
```

Setup singleton services:
```typescript
import { FireAuth, FireAuthSession } from '@typeheim/fire-auth'

const auth = firebase.auth()

FireAuth.setAuthDriver(auth)
FireAuthSession.setAuthDriver(auth)
```

Alternatively you can create your own singleton services or set up DI in your framework:
```typescript
import { AuthManager, AuthSession } from '@typeheim/fire-auth'

const auth = firebase.auth()

const Auth = new AuthManager()
const Session = new AuthSession()

Auth.setAuthDriver(auth)
Session.setAuthDriver(auth)
```

## Sample

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
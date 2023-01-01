// import {
//     ScopeAction,
//     SpecScope,
// } from './utils/contracts'
// import * as FirebaseAdmin from 'firebase-admin'
// import { OrmOnFire } from '../../src/singletons'
// import { initializeApp } from 'firebase-admin'
// import { getFirestore } from 'firebase-admin/lib/firestore'
//
// export function SetUpFirebase() {
//     let keyOrPath = process?.env?.FL_ACCESS_KEY ?? __dirname + '/../../../../firestore.key.json'
//
//     console.log('initializing firebase')
//
//     const app = initializeApp({
//         credential: FirebaseAdmin.credential.cert(keyOrPath),
//         databaseURL: 'https://fire-legion.firebaseio.com',
//     })
//
//     console.log('creating db')
//     const db = getFirestore(app)
//
//     console.log('setting driver')
//     // FirebaseAdmin.initializeApp()
//     // @ts-ignore - there is no error but TS can't compile
//     OrmOnFire.driver = db
// }
//
// export const SpecKit = {
//     prepareScope: (): SpecScope => {
//         return {
//             fixtures: {},
//         }
//     },
//
//     setUpFixtures: (executionScope: SpecScope, action: ScopeAction) => {
//         return async (done) => {
//             SetUpFirebase()
//             return action(executionScope, done)
//         }
//     },
//
//     runScopeAction: (executionScope: SpecScope, action: ScopeAction) => {
//         return async (done) => {
//             await action(executionScope, done)
//         }
//     },
//
//     runAsyncAction: (action: (done?) => void) => {
//         return async (done) => {
//             await action(done)
//         }
//     },
// }

import {
    ScopeAction,
    SpecScope,
} from './utils/contracts'
import { OrmOnFire } from '../../src/singletons'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export function SetUpFirebase() {
    console.log('initializing firebase')
    const app = initializeApp({
        apiKey: 'AIzaSyDBLqnWhJiBoNFiDur7QLFuXNGrNukzb_s',
        authDomain: 'fire-legion.firebaseapp.com',
        databaseURL: 'https://fire-legion.firebaseio.com',
        projectId: 'fire-legion',
        storageBucket: 'fire-legion.appspot.com',
        messagingSenderId: '361614982123',
        appId: '1:361614982123:web:d34ebf5d216d17d05b77ae',
        measurementId: 'G-NSHHJSHZ4X',
    })
    console.log('creating db')
    const db = getFirestore(app)

    console.log('setting driver')
    // @ts-ignore - there is no error but TS can't compile
    OrmOnFire.driver = db
}

export const SpecKit = {
    prepareScope: (): SpecScope => {
        return {
            fixtures: {},
        }
    },

    setUpFixtures: (executionScope: SpecScope, action: ScopeAction) => {
        return async (done) => {
            SetUpFirebase()
            return action(executionScope, done)
        }
    },

    runScopeAction: (executionScope: SpecScope, action: ScopeAction) => {
        return async (done) => {
            await action(executionScope, done)
        }
    },

    runAsyncAction: (action: (done?) => void) => {
        return async (done) => {
            await action(done)
        }
    },
}

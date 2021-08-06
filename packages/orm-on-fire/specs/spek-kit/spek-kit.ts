import {
    ScopeAction,
    SpecScope,
} from './utils/contracts'
import * as FirebaseAdmin from 'firebase-admin'
import { OrmOnFire } from '../../src/singletons'

export function SetUpFirebase() {
    let keyOrPath = process?.env?.FL_ACCESS_KEY ?? process.cwd() + '/firestore.key.json'

    FirebaseAdmin.initializeApp({
        credential: FirebaseAdmin.credential.cert(keyOrPath),
        databaseURL: 'https://fire-legion.firebaseio.com',
    })
    // @ts-ignore - there is no error but TS can't compile
    OrmOnFire.driver = FirebaseAdmin.firestore()
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

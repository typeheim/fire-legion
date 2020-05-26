import { ScopeAction, SpecScope } from './utils/contracts'
import * as FirebaseAdmin from 'firebase-admin'
import { OrmOnFire } from '../../src/singletons'

async function SetUpFirebase() {
    FirebaseAdmin.initializeApp({
        credential: FirebaseAdmin.credential.cert(process.cwd() + '/firestore.key.json'),
        databaseURL: "https://fire-legion.firebaseio.com",
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
        return async () => {
            await SetUpFirebase()
            await action(executionScope)
        }
    },

    runScopeAction: (executionScope: SpecScope, action: ScopeAction) => {
        return async () => {
            await action(executionScope)
        }
    },

    runAsyncAction: (action: () => void) => {
        return async () => {
            await action()
        }
    }
}

import * as FirebaseAdmin from 'firebase-admin'
import { OrmOnFire } from '../../src/singletons'


describe('OrmOnFire', () => {
    it('mark orm as initialized when driver set', async (done) => {
        // @ts-ignore
        OrmOnFire.driver = FirebaseAdmin.firestore()
        let isInitialized = await OrmOnFire.isInitialized

        expect(isInitialized).toBeTruthy()
        done()
    })

    beforeAll(() => {
        let keyOrPath = process?.env?.FL_ACCESS_KEY ?? process.cwd() + '/firestore.key.json'
        FirebaseAdmin.initializeApp({
            credential: FirebaseAdmin.credential.cert(keyOrPath),
            databaseURL: 'https://fire-legion.firebaseio.com',
        })
    })
})

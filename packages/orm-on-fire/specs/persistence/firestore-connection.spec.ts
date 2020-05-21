import * as FirebaseAdmin from 'firebase-admin'
import { OrmOnFire } from '../../src/singletons'


describe('OrmOnFire', () => {
    it('mark orm as initialized when driver set', async (done) => {
        OrmOnFire.driver = FirebaseAdmin.firestore()
        let isInitialized = await OrmOnFire.isInitialized

        expect(isInitialized).toBeTruthy()
        done()
    })

    beforeAll(() => {
        FirebaseAdmin.initializeApp({
            credential: FirebaseAdmin.credential.cert(process.cwd() + '/firestore.key.json'),
            databaseURL: 'https://fire-legion.firebaseio.com',
        })
    })
})

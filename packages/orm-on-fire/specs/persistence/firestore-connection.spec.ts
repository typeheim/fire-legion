import { OrmOnFire } from '../../src/singletons'


describe('OrmOnFire', () => {
    it('mark orm as initialized when driver set', async () => {
        // // @ts-ignore
        // OrmOnFire.driver = FirebaseAdmin.firestore()
        let isInitialized = await OrmOnFire.isInitialized

        expect(isInitialized).toBeTruthy()
    })

    // beforeAll(() => {
    //     let keyOrPath = process?.env?.FL_ACCESS_KEY ?? process.cwd() + '/firestore.key.json'
    //     FirebaseAdmin.initializeApp({
    //         credential: FirebaseAdmin.credential.cert(keyOrPath),
    //         databaseURL: 'https://fire-legion.firebaseio.com',
    //     })
    // })
})

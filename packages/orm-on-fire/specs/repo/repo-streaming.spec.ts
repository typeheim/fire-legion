import * as FirebaseAdmin from 'firebase-admin'
import { Repo } from '../../src/singletons'
import { SpecKit, User } from '../spek-kit'
import { DestroyEvent } from '@typeheim/fire-rx'


describe('Repo', () => {
    const scope = SpecKit.prepareScope()
    const destroyEvent = new DestroyEvent()

    it('can stream data', async (done) => {
        await Repo.of(User).all().stream().until(destroyEvent).subscribe(users => {
            expect(users.length).toEqual(2)

            done()
        })
    })

    it('can stream changes', async (done) => {
        await Repo.of(User).all().changes().until(destroyEvent).subscribe(users => {
            expect(users.length).toEqual(2)

            done()
        })
    })

    beforeAll(SpecKit.setUpFixtures(scope, async (scope) => {
        const Firestore = FirebaseAdmin.firestore()

        let ben = {
            name: 'Ben'
        }
        await Firestore.collection('user').doc('ben').set(ben)
        scope.fixtures['ben'] = ben

        let alex = {
            name: 'Alex'
        }
        await Firestore.collection('user').doc('alex').set(alex)
        scope.fixtures['alex'] = alex
    }))

    afterAll(() => { destroyEvent.emit() })
})



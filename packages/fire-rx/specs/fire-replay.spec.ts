import { FireReplaySubject } from '../index'


describe('FireReplaySubject', () => {
    it('can be executed as promise', async (done) => {
        let subject = new FireReplaySubject<number>(1)

        subject.next(5)
        let value = await subject
        expect(value).toEqual(5)

        subject.next(6)
        let nextValue = await subject
        expect(nextValue).toEqual(6)


        subject.complete()

        done()
    })
    it('can replay values as promise', async (done) => {
        let subject = new FireReplaySubject<number>(1)

        subject.next(5)
        expect(await subject).toEqual(5)
        expect(await subject).toEqual(5)

        subject.next(6)
        expect(await subject).toEqual(6)
        expect(await subject).toEqual(6)

        subject.complete()

        expect(await subject).toEqual(6)

        done()
    })

    it('can be run as typical subject', async (done) => {
        let subject = new FireReplaySubject<number>(1)

        subject.next(5)

        let value = await subject.subscribe(value => {
            expect(value).toEqual(5)
            subject.complete()
            done()
        })
    })
})

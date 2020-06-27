import {
    DestroyEvent,
    StatefulProducer,
} from '../index'

describe('StatefulStream', () => {
    it('unsubscribe all subscriptions on stop ', async (done) => {
        let subject = new StatefulProducer<number>(1)
        let subscriptions = []

        subscriptions.push(subject.subscribe(data => data))
        subscriptions.push(subject.subscribe(data => data))

        subject.next(1)

        subject.stop()

        expect(subject.isStopped).toBeTruthy()
        expect(subject.closed).toBeTruthy()

        expect(subscriptions[0].closed).toBeTruthy()
        expect(subscriptions[0].closed).toBeTruthy()

        done()
    })

    it('unsubscribe all subscriptions on stop', async (done) => {
        let subject = new StatefulProducer<number>(1)
        let destroyEvent = new DestroyEvent()

        subject.emitUntil(destroyEvent)

        let subscriptions = []

        subscriptions.push(subject.subscribe(data => data))
        subscriptions.push(subject.subscribe(data => data))

        subject.next(1)

        destroyEvent.emit()

        expect(subject.isStopped).toBeTruthy()
        expect(subject.closed).toBeTruthy()

        expect(subscriptions[0].closed).toBeTruthy()
        expect(subscriptions[0].closed).toBeTruthy()

        done()
    })
})


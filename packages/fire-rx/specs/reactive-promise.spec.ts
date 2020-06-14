import { ReactivePromise } from '..'

describe('ReactivePromise', () => {
    it('can return value multiple times as promise', async (done) => {
        let promise = new ReactivePromise<number>()

        promise.resolve(5)

        expect(await promise).toEqual(5)
        expect(await promise).toEqual(5)
        expect(await promise).toEqual(5)
        expect(await promise).toEqual(5)
        // promise should unsubscribe all subscriptions
        expect(promise.subscriptionsCount).toEqual(0)

        done()
    })

    it('can return value multiple times through subscriptions', async (done) => {
        let promise = new ReactivePromise<number>()

        promise.resolve(5)

        promise.subscribe(value => {
            expect(value).toEqual(5)
            promise.subscribe(value => {
                expect(value).toEqual(5)
                // promise should unsubscribe all subscriptions
                expect(promise.subscriptionsCount).toEqual(0)

                done()
            })
        })

        done()
    })
})

import { ReactivePromise } from '..'
import { ReplaySubject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

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

    // it('can be used in operators', async (done) => {
    //     let subject = new ReplaySubject(1)
    //     let promise = new ReactivePromise<number>()
    //
    //     subject.pipe(takeUntil(promise)).subscribe(data => {}, null, () => {
    //         expect(true).toBeTruthy()
    //         done()
    //     })
    //
    //     promise.resolve(1)
    //
    //     done()
    // })

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

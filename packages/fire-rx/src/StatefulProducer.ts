import {
    ReplaySubject,
    SchedulerLike,
} from 'rxjs'
import { SubscriptionsHub } from '@typeheim/fire-rx'
import { Subscribable } from './contracts'

export class StatefulProducer<T> extends ReplaySubject<T> {
    protected _emitsCount = 0
    protected hub = new SubscriptionsHub()


    constructor(bufferSize: number = 1, windowTime: number = Number.POSITIVE_INFINITY, scheduler?: SchedulerLike) {
        super(bufferSize, windowTime, scheduler)
    }

    get emitsCount() {
        return this._emitsCount
    }

    get subscriptionsCount() {
        return this.hub.count
    }


    next(value?: T): void {
        this._emitsCount++
        super.next(value)
    }

    /**
     * @deprecated internal method
     */
    _subscribe(subscriber) {
        let sub = super._subscribe(subscriber)
        this.hub.add(sub)

        return sub
    }

    /**
     * Subscribe to a destruction event to complete and unsubscribe as it
     * emits
     */
    emitUntil(destroyEvent: Subscribable<any>) {
        destroyEvent.subscribe(() => {
            this.stop()
        })

        return this
    }

    /**
     * Completes subject and clean up resources
     */
    stop() {
        if (!this.isStopped) {
            this.complete()
        }
        this.hub.unsubscribe()

        if (!this.closed) {
            this.unsubscribe()
        }
    }

    /**
     * Completes subject with error and unsubscribe all subscriptions
     */
    fail(error) {
        this.error(error)
        this.hub.unsubscribe()

        if (!this.closed) {
            this.unsubscribe()
        }
    }

    /**
     * @deprecated
     */
    close() {
        this.stop()
    }
}

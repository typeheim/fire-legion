import {
    BehaviorSubject,
    Subscribable,
} from 'rxjs'
import { SubscriptionsHub } from './SubscriptionsHub'

export class ValueSubject<T> extends BehaviorSubject<T> {
    protected _emitsCount = 0
    protected hub = new SubscriptionsHub()

    get emitsCount() {
        return this._emitsCount
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
     * @deprecated
     */
    until(destroyEvent: Subscribable<any>) {
        return this.emitUntil(destroyEvent)
    }

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

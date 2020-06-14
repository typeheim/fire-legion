import {
    ReplaySubject,
    Subscribable,
} from 'rxjs'

import { SubscriptionLike, Unsubscribable, PartialObserver } from './contracts'
import { SubscriptionsHub } from './SubscriptionsHub'

export class ReactivePromise<T> implements Subscribable<T> {
    protected internalPromise: Promise<T>
    protected internalSubject = new ReplaySubject<T>(1)
    protected value: T
    protected _resolved = false
    protected subHub = new SubscriptionsHub()

    constructor(executor?: PromiseExecutor<T>) {
        this.internalPromise = new Promise<T>((resolve, reject) => {
            this.subHub.add(this.subscribe((data) => {
                resolve(data)
            }, error => {
                reject(error)
            }, () => {
                resolve(this.value)
            }))
        })

        if (executor) {
            executor((value) => this.resolve(value), (reason) => this.reject(reason))
        }
    }

    get resolved() {
        return this._resolved
    }

    get subscriptionsCount() {
        return this.subHub.count
    }

    resolve(value?: T): void {
        if (this.resolved) {
            throw PromiseResolvedException.withMessage('Promise already resolved')
        }
        this.value = value
        this._resolved = true
        this.internalSubject.next(value)
        this.internalSubject.complete()
        this.subHub.unsubscribe()
    }

    reject(error?: any) {
        if (this.resolved) {
            throw PromiseResolvedException.withMessage('Promise already resolved')
        }
        this.internalSubject.error(error)
        this.subHub.unsubscribe()
    }

    /**
     * Subscribe to a destruction event to complete and unsubscribe as it
     * emits
     */
    until(destroyEvent: Subscribable<any>) {
        destroyEvent.subscribe(() => {
            if (!this.resolved) {
                this.internalSubject.complete()
                this.subHub.unsubscribe()
            }
        })

        return this
    }

    //
    //
    // SUBJECT INTERFACE
    //
    //

    subscribe(observer?: PartialObserver<T>): Unsubscribable;
    /** @deprecated Use an observer instead of a complete callback */
    subscribe(next: null | undefined, error: null | undefined, complete: () => void): Unsubscribable;
    /** @deprecated Use an observer instead of an error callback */
    subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Unsubscribable;
    /** @deprecated Use an observer instead of a complete callback */
    subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): Unsubscribable;
    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Unsubscribable
    subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
              error?: (error: any) => void,
              complete?: () => void): SubscriptionLike {
        // @ts-ignore
        let sub = this.internalSubject.subscribe(observerOrNext, error, complete)

        if (this.resolved) {
            this.subHub.unsubscribe()
        }

        return sub
    }

    pipe(...operators: any) {
        // @ts-ignore
        return this.internalSubject.pipe(...operators)
    }


    //
    //
    // PROMISE INTERFACE
    //
    //

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
        return this.internalPromise.then(onfulfilled)
    }

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
        return this.internalPromise.catch(onrejected)
    }

    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T> {
        return this.internalPromise.finally(onfinally)
    }
}

export type PromiseExecutor<T> = (resolve: (value?: T) => void, reject: (reason?: any) => void) => void


export class PromiseResolvedException extends Error {
    protected constructor(message: string) {super(message)}

    static withMessage(message: string) {
        return new PromiseResolvedException(message)
    }
}

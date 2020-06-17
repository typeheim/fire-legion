import { ReplaySubject } from 'rxjs'
import { SubscriptionsHub } from './SubscriptionsHub'

/**
 * Special type of subject that should be used in pair with `until` method of
 * Fire subjects to complete them.
 */
export class DestroyEvent extends ReplaySubject<boolean> {
    protected hub = new SubscriptionsHub()

    /**
     * @deprecated internal method
     */
    _subscribe(subscriber) {
        let sub = super._subscribe(subscriber)
        this.hub.add(sub)
        return sub
    }

    public emit() {
        this.next(true)
        this.complete()
        this.hub.unsubscribe()
    }
}

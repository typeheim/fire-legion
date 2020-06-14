import { StatefulSubject } from './StatefulSubject'
import { SubscriptionsHub } from './SubscriptionsHub'
import { PartialObserver, SubscriptionLike } from './contracts'

export class ReactiveStream<T> extends StatefulSubject<T> {
    protected subHub = new SubscriptionsHub()

    // @ts-ignore
    subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
              error?: (error: any) => void,
              complete?: () => void): SubscriptionLike {
        // @ts-ignore
        let sub = super.subscribe(observerOrNext, error, complete)

        this.subHub.add(sub)

        return sub
    }

    close() {
        this.complete()
        this.subHub.unsubscribe()
        this.unsubscribe()
    }
}

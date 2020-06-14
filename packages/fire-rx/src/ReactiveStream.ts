import {
    StatefulSubject,
    SubscriptionsHub,
} from '@typeheim/fire-rx'
import { PartialObserver } from 'rxjs/src/internal/types'
import { Subscription } from 'rxjs/src/internal/Subscription'

export class ReactiveStream<T> extends StatefulSubject<T> {
    protected subHub = new SubscriptionsHub()

    // @ts-ignore
    subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
              error?: (error: any) => void,
              complete?: () => void): Subscription {
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

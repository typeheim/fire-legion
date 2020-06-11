import { SubscriptionLike } from 'rxjs'
import { DestroyEvent } from '@typeheim/fire-rx'

export class SubscriptionsHub {
    protected subscriptions: SubscriptionLike[] = []

    constructor(destroyEvent?: DestroyEvent) {
        if (destroyEvent) {
            this.collectUntil(destroyEvent)
        }
    }

    collectUntil(destroyEvent: DestroyEvent) {
        destroyEvent.subscribe(() => { this.unsubscribe() })
    }

    add(subscription: SubscriptionLike) {
        this.subscriptions.push(subscription)
    }

    unsubscribe() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe()
        })
    }
}

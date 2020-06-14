import { DestroyEvent } from '@typeheim/fire-rx'
import { Unsubscribable } from 'rxjs/src/internal/types'

export class SubscriptionsHub {
    protected subscriptions: Unsubscribable[] = []

    constructor(destroyEvent?: DestroyEvent) {
        if (destroyEvent) {
            this.collectUntil(destroyEvent)
        }
    }

    get count() {
        return this.subscriptions.length
    }

    collectUntil(destroyEvent: DestroyEvent) {
        destroyEvent.subscribe(() => { this.unsubscribe() })
    }

    add(subscription: Unsubscribable) {
        this.subscriptions.push(subscription)
    }

    unsubscribe() {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe()
        })
        this.subscriptions = []
    }
}

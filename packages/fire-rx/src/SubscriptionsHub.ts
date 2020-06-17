import { DestroyEvent } from '@typeheim/fire-rx'
import { Unsubscribable } from './contracts'

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
            if (subscription['closed'] !== undefined && !subscription['closed']) {
                subscription.unsubscribe()
            } else {
                // @todo - figure out a better way to prevent duplication
                subscription.unsubscribe()
            }
        })
        this.subscriptions = []
    }
}

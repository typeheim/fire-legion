// Firestore types
import * as types from '@firebase/firestore-types'

import { StatefulSubject } from '@typeheim/fire-rx'
import { EntityManager } from './EntityManager'
import { DocReference } from './DocReference'
import DocumentSnapshot = types.DocumentSnapshot
import { EntityStream } from '../Data/EntityStream'
import { EntityPromise } from '../Data/EntityPromise'

export class EntityQuery<Entity> {
    constructor(protected docReference: DocReference, protected entityBuilder: EntityManager<Entity>) {}

    get(): EntityPromise<Entity> {
        let promise = new EntityPromise<Entity>()

        if (this.docReference) {
            this.docReference.get().subscribe({
                next: (docSnapshot: DocumentSnapshot) => {
                    promise.resolve(this.entityBuilder.fromSnapshot(docSnapshot))
                },
                error: error => promise.reject(error),
            })
        } else {
            promise.resolve(null)
        }

        return promise
    }

    stream(): EntityStream<Entity> {
        let stream = new EntityStream<Entity>((context) => {
            this.docReference.snapshot().subscribe({
                next: (docSnapshot: DocumentSnapshot) => {
                    context.next(this.entityBuilder.fromSnapshot(docSnapshot))
                },
                error: error => context.fail(error),
                complete: () => context.stop(),
            })
        })

        return stream
    }
}

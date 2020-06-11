// Firestore types
import * as types from '@firebase/firestore-types'
import DocumentSnapshot = types.DocumentSnapshot

import { StatefulSubject } from '@typeheim/fire-rx'
import { EntityManager } from './EntityManager'
import { DocReference } from './DocReference'

export class EntityQuery<Entity> {
    constructor(protected docReference: DocReference, protected entityBuilder: EntityManager<Entity>) {}

    get(): StatefulSubject<Entity> {
        let subject = new StatefulSubject<Entity>(1)

        this.docReference.get().subscribe((docSnapshot: DocumentSnapshot) => {
            subject.next(this.entityBuilder.fromSnapshot(docSnapshot))
            subject.complete()
        })

        return subject
    }

    stream(): StatefulSubject<Entity> {
        let subject = new StatefulSubject<Entity>(1)

        this.docReference.snapshot().subscribe((docSnapshot: DocumentSnapshot) => {
            subject.next(this.entityBuilder.fromSnapshot(docSnapshot))
        })

        return subject
    }
}

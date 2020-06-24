// Firestore types
import * as types from '@firebase/firestore-types'

import { StatefulStream } from '@typeheim/fire-rx'
import { EntityManager } from './EntityManager'
import { DocReference } from './DocReference'
import DocumentSnapshot = types.DocumentSnapshot

export class EntityQuery<Entity> {
    constructor(protected docReference: DocReference, protected entityBuilder: EntityManager<Entity>) {}

    get(): StatefulStream<Entity> {
        let subject = new StatefulStream<Entity>(1)

        this.docReference.get().subscribe((docSnapshot: DocumentSnapshot) => {
            subject.next(this.entityBuilder.fromSnapshot(docSnapshot))
            subject.complete()
        }, error => subject.error(error))

        return subject
    }

    stream(): StatefulStream<Entity> {
        let subject = new StatefulStream<Entity>(1)

        this.docReference.snapshot().subscribe((docSnapshot: DocumentSnapshot) => {
            subject.next(this.entityBuilder.fromSnapshot(docSnapshot))
        }, error => subject.error(error))

        return subject
    }
}

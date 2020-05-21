import { firestore } from 'firebase/app';
import { FireReplaySubject } from '@typeheim/fire-rx'
import { EntityManager } from './EntityManager'
import { DocReference } from './DocReference'

export class EntityQuery<Entity> {
    constructor(protected docReference: DocReference, protected entityBuilder: EntityManager<Entity>) {}

    get(): FireReplaySubject<Entity> {
        let subject = new FireReplaySubject<Entity>(1)

        this.docReference.get().subscribe((docSnapshot: firestore.DocumentSnapshot) => {
            subject.next(this.entityBuilder.fromSnapshot(docSnapshot))
            subject.complete()
        })

        return subject
    }

    stream(): FireReplaySubject<Entity> {
        let subject = new FireReplaySubject<Entity>(1)

        this.docReference.snapshot().subscribe((docSnapshot: firestore.DocumentSnapshot) => {
            subject.next(this.entityBuilder.fromSnapshot(docSnapshot))
        })

        return subject
    }
}

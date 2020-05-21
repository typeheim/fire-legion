import { DocumentChange, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot } from '@google-cloud/firestore'
import { EntityManager } from './EntityManager'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { ChangedEntities } from '../Data/ChangedEntities'
import { CollectionReference } from './CollectionReference'

export class CollectionQuery<Entity> {
    constructor(protected collectionReference: CollectionReference, protected entityBuilder: EntityManager<Entity>) {}

    get(): FireReplaySubject<Entity[]> {
        let subject = new FireReplaySubject<Entity[]>(1)

        this.collectionReference.get().then((querySnapshot: QuerySnapshot) => {
            let entities = []
            querySnapshot.forEach((docSnapshot: DocumentSnapshot) => {
                entities.push(this.entityBuilder.fromSnapshot(docSnapshot))
            })
            subject.next(entities)
            subject.complete()
        })

        return subject
    }

    changesStream(): FireReplaySubject<ChangedEntities<Entity>> {
        let subject = new FireReplaySubject<ChangedEntities<Entity>>(1)

        this.collectionReference.snapshot().subscribe((querySnapshot: QuerySnapshot) => {
            let entityChanges = []
            querySnapshot.docChanges().forEach((docSnapshot: DocumentChange) => {
                let entity = this.entityBuilder.fromSnapshot(docSnapshot.doc)
                if (entity) {
                    entityChanges.push({
                        type: docSnapshot.type,
                        entity
                    })
                }
            })
            subject.next(new ChangedEntities<Entity>(entityChanges))
        })

        return subject
    }

    dataStream(): FireReplaySubject<Entity[]> {
        let subject = new FireReplaySubject<Entity[]>(1)

        this.collectionReference.snapshot().subscribe((querySnapshot: QuerySnapshot) => {
            let entities = []
            querySnapshot.forEach((docSnapshot: QueryDocumentSnapshot) => {
                let entity = this.entityBuilder.fromSnapshot(docSnapshot)
                if (entity) {
                    entities.push(entity)
                }
            })
            subject.next(entities)
        })

        return subject
    }
}

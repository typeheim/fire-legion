import { firestore } from 'firebase/app';
import { EntityManager } from './EntityManager'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { ChangedEntities } from '../Data/ChangedEntities'
import { CollectionReference } from './CollectionReference'

export class CollectionQuery<Entity> {
    constructor(protected collectionReference: CollectionReference, protected entityBuilder: EntityManager<Entity>) {}

    get(): FireReplaySubject<Entity[]> {
        let subject = new FireReplaySubject<Entity[]>(1)

        this.collectionReference.get().then((querySnapshot: firestore.QuerySnapshot) => {
            let entities = []
            querySnapshot.forEach((docSnapshot: firestore.DocumentSnapshot) => {
                entities.push(this.entityBuilder.fromSnapshot(docSnapshot))
            })
            subject.next(entities)
            subject.complete()
        })

        return subject
    }

    changesStream(): FireReplaySubject<ChangedEntities<Entity>> {
        let subject = new FireReplaySubject<ChangedEntities<Entity>>(1)

        this.collectionReference.snapshot().subscribe((querySnapshot: firestore.QuerySnapshot) => {
            let entityChanges = []
            querySnapshot.docChanges().forEach((docSnapshot: firestore.DocumentChange) => {
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

        this.collectionReference.snapshot().subscribe((querySnapshot: firestore.QuerySnapshot) => {
            let entities = []
            querySnapshot.forEach((docSnapshot: firestore.QueryDocumentSnapshot) => {
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

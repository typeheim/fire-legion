import { WriteResult } from '@google-cloud/firestore'
import { EntityManager } from './EntityManager'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { CollectionReference } from './CollectionReference'

// @todo try decoupling from direct use of entity manager
export class DocInitializer<Entity> {
    constructor(protected entity: Entity, protected entityManager: EntityManager<Entity>) {}

    addTo(collectionRef: CollectionReference): FireReplaySubject<WriteResult> {
        let data = this.entityManager.extractDataFromEntity(this.entity)
        let documentReference = this.entity['id'] ? collectionRef.doc(this.entity['id']) : collectionRef.doc()

        let subject = new FireReplaySubject<WriteResult>(1)
        documentReference.set(data).then((result: WriteResult) => {
            this.entity['id'] = documentReference.nativeRef.id
            this.entityManager.attachOrmMetadataToEntity(this.entity, documentReference.nativeRef)
            subject.next(result)
            subject.complete()
        })

        return subject
    }
}

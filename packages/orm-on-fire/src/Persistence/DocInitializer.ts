import { EntityManager } from './EntityManager'
import { StatefulSubject } from '@typeheim/fire-rx'
import { CollectionReference } from './CollectionReference'

// @todo try decoupling from direct use of entity manager
export class DocInitializer<Entity> {
    constructor(protected entity: Entity, protected entityManager: EntityManager<Entity>) {}

    addTo(collectionRef: CollectionReference): StatefulSubject<boolean> {
        let data = this.entityManager.extractDataFromEntity(this.entity)
        let documentReference = this.entity['id'] ? collectionRef.doc(this.entity['id']) : collectionRef.doc()

        let subject = new StatefulSubject<boolean>(1)
        documentReference.set(data).then(() => {
            this.entity['id'] = documentReference.nativeRef.id
            this.entityManager.attachOrmMetadataToEntity(this.entity, documentReference.nativeRef)
            subject.next(true)
            subject.complete()
        }).catch(error => {
            subject.error(error)
        })

        return subject
    }
}

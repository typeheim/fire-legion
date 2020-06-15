import { EntityManager } from './EntityManager'
import { ReactivePromise } from '@typeheim/fire-rx'
import { CollectionReference } from './CollectionReference'

// @todo try decoupling from direct use of entity manager
export class DocInitializer<Entity> {
    constructor(protected entity: Entity, protected entityManager: EntityManager<Entity>) {}

    addTo(collectionRef: CollectionReference): ReactivePromise<boolean> {
        let data = this.entityManager.extractDataFromEntity(this.entity)
        // type safety check to ensure dock path will be a string
        if (this.entity['id'] && typeof this.entity['id'] !== 'string') {
            this.entity['id'] = '' + this.entity['id']
        }

        let documentReference = this.entity['id'] ? collectionRef.doc(this.entity['id']) : collectionRef.doc()

        let promise = new ReactivePromise<boolean>()
        documentReference.set(data).then(() => {
            this.entity['id'] = documentReference.nativeRef.id
            this.entityManager.attachOrmMetadataToEntity(this.entity, documentReference.nativeRef)
            promise.resolve(true)
        }).catch(error => {
            promise.reject(error)
        })

        return promise
    }
}

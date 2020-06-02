// Firestore types
import * as types from '@firebase/firestore-types'
import DocumentSnapshot = types.DocumentSnapshot
import DocumentReference = types.DocumentReference

import { EntityMetadata } from '../Contracts/EntityMetadata'

import { GenericRepository } from '../Model/GenericRepository'
import { Metadata, OrmOnFire } from '../singletons'
import { Collection } from '../Model/Collection'
import { EntityType } from '../Contracts/EntityType'
import { Reference } from '../Model/Reference'
import { DocInitializer } from './DocInitializer'
import { DocPersistenceManager } from './DocPersistenceManager'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { CollectionReference } from './CollectionReference'
import { DocReference } from './DocReference'

export class EntityManager<Entity> {
    constructor(protected metadata: EntityMetadata, protected repository: GenericRepository<Entity>, protected entityConstructor) {}

    fromSnapshot(docSnapshot: DocumentSnapshot): Entity {
        if (!docSnapshot.exists) {
            return null
        }
        let data = docSnapshot.data()
        let entity = new this.entityConstructor()
        const fields = this.metadata.fields
        entity['id'] = docSnapshot.id

        this.attachOrmMetadataToEntity(entity, docSnapshot.ref)
        this.attachSubCollectionsToEntity(entity, docSnapshot.ref)
        this.attachRefsToEntity(entity)

        for (let field in data) {
            if (this.metadata.docRefs[field]) {
                entity[field].___attachDockRef(DocReference.fromNativeRef(data[field]))
            } else {
                entity[field] = data[field]
            }
        }

        if (!entity['toJSON']) {
            //@todo need to add support for passing additional properties
            entity['toJSON'] = () => {
                let jsonData = {}
                fields.forEach(field => {
                    if (entity[field.name] !== undefined) {
                        jsonData[field.name] = entity[field.name]
                    }
                })
                return JSON.stringify(jsonData)
            }
        }

        if(typeof entity.init === 'function') {
            // @todo handle promises
            entity.init()
        }

        return entity
    }

    createEntity(collectionRef: CollectionReference) {
        let entity = new this.entityConstructor()
        this.attachMetadataToNewEntity(entity, collectionRef)

        return entity
    }


    protected attachSubCollectionsToEntity(entity: Entity, docReference: DocumentReference) {
        let subCollectionsMetadata = this.metadata.collectionRefs
        if (subCollectionsMetadata.length == 0) {
            return
        }

        subCollectionsMetadata.forEach(subCollection => {
            entity[subCollection.fieldName] = new Collection(this.createRepositoryForSubEntity(subCollection.entity, docReference))
        })
    }

    protected attachRefsToEntity(entity: Entity) {
        let docRefs = this.metadata.docRefs

        for (let fieldName in docRefs) {
            entity[fieldName] = new Reference(docRefs[fieldName].entity, entity)
        }
    }

    protected createRepositoryForSubEntity<Entity>(entity: EntityType<Entity>, docReference: DocumentReference) {
        const metadata = Metadata.entity(entity).get()
        if (metadata.repository) {
            // @ts-ignore
            return new metadata.repository<Entity>(metadata, entity, docReference.collection(metadata.collection))
        } else {
            return new GenericRepository<Entity>(metadata, entity, new CollectionReference(OrmOnFire, `${docReference.path}/${metadata.collection}`))
        }
    }


    public extractDataFromEntity(entity: Entity) {
        const fields = this.metadata.fields
        let dataToSave = {}
        fields.forEach(field => {
            if (entity[field.name] !== undefined) {
                dataToSave[field.name] = entity[field.name]
            }
        })
        const docRefs = this.metadata.docRefs

        for (let fieldName in docRefs) {
            let docRef = entity[fieldName].___docReference
            if (docRef) {
                dataToSave[fieldName] = docRef.nativeRef
            }
        }

        return dataToSave
    }

    public attachOrmMetadataToEntity(entity: Entity, docReference: DocumentReference) {
        let persistenceManager = new DocPersistenceManager(docReference)
        entity['__ormOnFire'] = {
            repository: this.repository,
            docRef: DocReference.fromNativeRef(docReference),
            save: (): FireReplaySubject<boolean> => {
                return persistenceManager.update(this.extractDataFromEntity(entity))
            },
            remove: (): FireReplaySubject<boolean> => {
                return persistenceManager.remove()
            }

        }
    }

    public attachMetadataToNewEntity(entity: Entity, collectionRef: CollectionReference) {
        let docInitializer = new DocInitializer(entity, this)
        entity['__ormOnFire'] = {
            repository: this.repository,
            docRef: null,
            save: (): FireReplaySubject<boolean> => {
                return docInitializer.addTo(collectionRef)
            },
            remove: () => {
                // @todo throw exceptions
                return false
            }
        }
    }
}


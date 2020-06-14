// Firestore types
import * as types from '@firebase/firestore-types'

import { EntityMetadata } from '../Contracts/EntityMetadata'

import { GenericRepository } from '../Model/GenericRepository'
import {
    Metadata,
    OrmOnFire,
} from '../singletons'
import { Collection } from '../Model/Collection'
import { EntityType } from '../Contracts/EntityType'
import { Reference } from '../Model/Reference'
import { DocInitializer } from './DocInitializer'
import { DocPersistenceManager } from './DocPersistenceManager'
import { StatefulSubject } from '@typeheim/fire-rx'
import { CollectionReference } from './CollectionReference'
import { DocReference } from './DocReference'
import DocumentSnapshot = types.DocumentSnapshot
import DocumentReference = types.DocumentReference

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
        this.attachRefsToEntity(entity, data)

        this.metadata.fields.forEach(field => {
            if (data[field.name] !== undefined) {
                entity[field.name] = data[field.name]
            }
        })

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

        if (typeof entity.init === 'function') {
            // @todo handle promises
            entity.init()
        }

        return entity
    }

    protected createTextIndex(text: string): string[] {
        const arrName = []
        let curName = ''
        text.split('').forEach(letter => {
            curName += letter
            arrName.push(curName)
        })
        return arrName
    }

    protected createReverseTextIndex(text: string): string[] {
        const arrName = []
        let curName = ''
        text.split('').reverse().forEach(letter => {
            curName += letter
            arrName.push(curName)
        })
        return arrName
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

    protected attachRefsToEntity(entity: Entity, data) {
        let docRefs = this.metadata.docRefs

        for (let fieldName in docRefs) {
            entity[fieldName] = new Reference(docRefs[fieldName].entity, entity)
            if (data[fieldName] !== undefined) {
                entity[fieldName].___attachDockRef(DocReference.fromNativeRef(data[fieldName]))
            }
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
                if (field.isText) {
                    dataToSave[`__idx__text__${field.name}`] = this.createTextIndex(entity[field.name])
                    dataToSave[`__idx__text__reverse__${field.name}`] = this.createReverseTextIndex(entity[field.name])
                    dataToSave[`__idx__text-match__${field.name}`] = this.createTextIndex(entity[field.name]).map(word => word.toLowerCase())
                }
            }
        })
        const docRefs = this.metadata.docRefs

        for (let fieldName in docRefs) {
            let docRef = entity[fieldName]?.___docReference
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
            save: (): StatefulSubject<boolean> => {
                return persistenceManager.update(this.extractDataFromEntity(entity))
            },
            remove: (): StatefulSubject<boolean> => {
                return persistenceManager.remove()
            },
        }
    }

    public attachMetadataToNewEntity(entity: Entity, collectionRef: CollectionReference) {
        let docInitializer = new DocInitializer(entity, this)
        entity['__ormOnFire'] = {
            repository: this.repository,
            docRef: null,
            save: (): StatefulSubject<boolean> => {
                return docInitializer.addTo(collectionRef)
            },
            remove: () => {
                // @todo throw exceptions
                return false
            },
        }
    }
}


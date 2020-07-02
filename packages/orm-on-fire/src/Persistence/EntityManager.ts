// Firestore types
import * as types from '@firebase/firestore-types'

import { EntityMetadata } from '../Contracts/EntityMetadata'
import { Reference } from '../Model/Reference'
import { DocInitializer } from './DocInitializer'
import { DocPersistenceManager } from './DocPersistenceManager'
import { ReactivePromise } from '@typeheim/fire-rx'
import { CollectionReference } from './CollectionReference'
import { DocReference } from './DocReference'
import { CollectionFactory } from '../singletons'
import { Timestamp } from '@google-cloud/firestore'
import { Model } from '../Contracts/Model'
import DocumentSnapshot = types.DocumentSnapshot
import DocumentReference = types.DocumentReference

export class EntityManager<Entity> {
    constructor(protected metadata: EntityMetadata, protected entityConstructor, protected collectionReference: CollectionReference) {}

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
            if (data[field.name] === undefined) {
                return
            } else if (field.isDate || (typeof data[field.name] === 'object' && data[field.name] instanceof Timestamp)) {
                entity[field.name] = data[field.name].toDate()
            } else {
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
            curName += letter.toLowerCase()
            arrName.push(curName)
        })
        return arrName
    }

    protected createReverseTextIndex(text: string): string[] {
        const arrName = []
        let curName = ''
        text.split('').reverse().forEach(letter => {
            curName += letter.toLowerCase()
            arrName.push(curName)
        })
        return arrName
    }

    createEntity() {
        let entity = new this.entityConstructor()
        this.attachMetadataToNewEntity(entity)

        return entity
    }

    protected attachSubCollectionsToEntity(entity: Entity, docReference: DocumentReference) {
        let subCollectionsMetadata = this.metadata.collectionRefs
        if (subCollectionsMetadata.length == 0) {
            return
        }

        subCollectionsMetadata.forEach(subCollection => {
            entity[subCollection.fieldName] = CollectionFactory.createWithRef(subCollection.entity, docReference)
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

    public extractDataFromEntity(entity: Model) {
        const fields = this.metadata.fields
        let dataToSave = {}
        fields.forEach(field => {
            if (field.isDate && field.updateOnSave) {
                let date = new Date()
                entity[field.name] = date
                dataToSave[field.name] = Timestamp.fromDate(date)
            } else if (field.isDate && field.generateOnCreate && (entity?.__ormOnFire?.isNew || entity.__ormOnFire === undefined)) {
                let date = new Date()
                entity[field.name] = date
                dataToSave[field.name] = Timestamp.fromDate(date)
            } else if (entity[field.name] !== undefined) {
                dataToSave[field.name] = entity[field.name]
                if (field.isText) {
                    dataToSave[`__idx__text__${field.name}`] = this.createTextIndex(entity[field.name])
                    dataToSave[`__idx__text__reverse__${field.name}`] = this.createReverseTextIndex(entity[field.name])
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

    public refreshNewEntity(entity: Entity, docReference: DocumentReference) {
        this.attachOrmMetadataToEntity(entity, docReference)
        this.attachSubCollectionsToEntity(entity, docReference)
    }

    public attachOrmMetadataToEntity(entity: Entity, docReference: DocumentReference) {
        let persistenceManager = new DocPersistenceManager(docReference)
        entity['__ormOnFire'] = {
            isNew: false,
            docRef: DocReference.fromNativeRef(docReference),
            save: (): ReactivePromise<boolean> => {
                return persistenceManager.update(this.extractDataFromEntity(entity))
            },
            remove: (): ReactivePromise<boolean> => {
                return persistenceManager.remove()
            },
        }
    }

    public attachMetadataToNewEntity(entity: Entity) {
        let docInitializer = new DocInitializer(entity, this)
        entity['__ormOnFire'] = {
            isNew: true,
            docRef: null,
            save: (): ReactivePromise<boolean> => {
                return docInitializer.addTo(this.collectionReference)
            },
            remove: () => {
                // @todo throw exceptions
                return false
            },
        }
    }
}


// Firestore types
import * as types from '@firebase/firestore-types'

import {
    EntityMetadata,
    PropertyMetadata,
} from '../Contracts/EntityMetadata'
import { Reference } from '../Model/Reference'
import { DocInitializer } from './DocInitializer'
import { DocPersistenceManager } from './DocPersistenceManager'
import { ReactivePromise } from '@typeheim/fire-rx'
import { CollectionReference } from './CollectionReference'
import { DocReference } from './DocReference'
import { CollectionFactory } from '../singletons'
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
            } else if (field?.isDate || (data[field.name]?.toDate !== undefined && typeof data[field.name]?.toDate === 'function') || (typeof data[field.name] === 'object' && data[field.name]?.constructor?.name === 'Timestamp')) {
                entity[field.name] = data[field.name].toDate()
            } else if (typeof data[field.name] === 'object' && field?.isMap && (typeof field?.constructor === 'object' || typeof field?.constructor === 'function')) {
                if (Array.isArray(data[field.name])) {
                    entity[field.name] = data[field.name].map(obj => Object.assign(new field.constructor(), obj))
                } else {
                    entity[field.name] = Object.assign(new field.constructor(), data[field.name])
                }
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
        let changes = null
        if (!(entity?.__ormOnFire?.isNew || entity.__ormOnFire === undefined)) {
            // not new entities require mutation check
            changes = entity?.__ormOnFire?.mutation?.getChanges(entity)
        }

        fields.forEach(field => {
            if (field?.isDate && field?.updateOnSave) {
                let date = new Date()
                entity[field.name] = date
                dataToSave[field.name] = date
            } else if (field?.isDate && field?.generateOnCreate && (entity?.__ormOnFire?.isNew || entity.__ormOnFire === undefined)) {
                let date = new Date()
                entity[field.name] = date
                dataToSave[field.name] = date
            } if (changes && field.name in changes) {
                dataToSave[field.name] = changes[field.name]
            } else if ((entity?.__ormOnFire?.isNew || entity.__ormOnFire === undefined) && entity[field.name] !== undefined) {
                // this condition required only for new entities
                if (field?.isMap && Array.isArray(entity[field.name])) {
                    dataToSave[field.name] = entity[field.name].map(obj => {
                        return { ...obj }
                    })
                } else if (field?.isMap) {
                    dataToSave[field.name] = { ...entity[field.name] }
                } else {
                    dataToSave[field.name] = entity[field.name]
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
            mutation: this.createMutationTracker(entity),
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

    protected createMutationTracker(entity: Entity) {
        return new MutationTracker(entity, this.metadata.fields)
    }
}


export class MutationTracker {
    protected copy = {}
    protected fields: PropertyMetadata[]

    constructor(entity, fields: PropertyMetadata[]) {
        this.fields = fields

        fields.forEach(field => {
            if (entity[field.name] === undefined) {
                return
            }

            if (Array.isArray(entity[field.name])) {
                // this.copy[field.name] = entity[field.name]?.slice()
                this.copy[field.name] = this.deepCopy(entity[field.name])
            } else if (field.isMap) {
                this.copy[field.name] = { ...entity[field.name] }
            } else if (typeof entity[field.name] === 'object' && entity[field.name] instanceof Date) {
                this.copy[field.name] = new Date(entity[field.name].getTime())
            } else if (typeof entity[field.name] === 'object') {
                this.copy[field.name] = { ...entity[field.name] }
            } else {
                this.copy[field.name] = entity[field.name]
            }
        })
    }

    getChanges(entity) {
        let changes = {}
        this.fields.forEach(field => {
            if (entity[field.name] === undefined && this.copy[field.name] !== undefined) {
                changes[field.name] = undefined
            } else if (entity[field.name] === undefined) {
                return
            } else if (Array.isArray(entity[field.name])) { // array should be checked explicitly
                if (JSON.stringify(entity[field.name]) !== JSON.stringify(this.copy[field.name])) {
                    changes[field.name] = entity[field.name]
                }
            } else if (typeof entity[field.name] === 'object' && entity[field.name] != null) {
                // dates must be compared by time
                if (entity[field.name] instanceof Date && entity[field.name]?.getTime() !== this.copy[field.name]?.getTime()) {
                    changes[field.name] = entity[field.name]
                } else if (JSON.stringify(entity[field.name]) !== JSON.stringify(this.copy[field.name])) {
                    // objects need deep equality compare
                    changes[field.name] = { ...entity[field.name] }
                }
            } else if (entity[field.name] != this.copy[field.name]) {
                changes[field.name] = entity[field.name]
            }

        })

        return changes
    }

    protected deepCopy(inObject) {
        let outObject, value, key

        if (typeof inObject !== 'object' || inObject === null) {
            return inObject // Return the value if inObject is not an object
        }

        // Create an array or object to hold the values
        outObject = Array.isArray(inObject) ? [] : {}

        for (key in inObject) {
            value = inObject[key]

            // Recursively (deep) copy for nested objects, including arrays
            outObject[key] = this.deepCopy(value)
        }

        return outObject
    }
}

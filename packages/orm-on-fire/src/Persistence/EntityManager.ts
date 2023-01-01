
import {
    EntityDocRefsMetadata,
    EntityMetadata,
    PropertyMetadata,
} from '../Contracts/EntityMetadata'
import { Reference } from '../Model/Reference'

import { DocPersistenceManager } from './DocPersistenceManager'
import { CollectionReference } from './CollectionReference'
import { DocReference } from './DocReference'
import { CollectionFactory } from '../singletons'
import { MutationTracker } from './MutationTracker'
import {
    doc,
    setDoc,
    DocumentSnapshot,
    DocumentReference,
    DocumentChange,
    QueryDocumentSnapshot,
    QuerySnapshot
} from "firebase/firestore";

// import FieldValue = types.FieldValue - somehow fails TS

export class EntityManager<Entity> {
    private static ormMetadataStore = new WeakMap<any, OrmMetadata<any>>()

    constructor(protected metadata: EntityMetadata, protected entityConstructor, protected collectionReference: CollectionReference) {}

    getOrmMetadata(entity): OrmMetadata<Entity> {
        return EntityManager.ormMetadataStore.get(entity)
    }

    fromSnapshot(docSnapshot: DocumentSnapshot): Entity {
        if (!docSnapshot.exists) {
            return null
        }
        let data = docSnapshot.data()
        let entity = new this.entityConstructor()
        const fields = this.metadata.fields
        entity['id'] = docSnapshot.id

        this.metadata.fields.forEach(field => {
            if (data[field.name] === undefined) {
                return
            } else if ((data[field.name]?.toDate !== undefined && typeof data[field.name]?.toDate === 'function') || (typeof data[field.name] === 'object' && data[field.name]?.constructor?.name === 'Timestamp')) {
                entity[field.name] = data[field.name]?.toDate()
            } else if (field?.isDate && data[field.name] && data[field.name]?.length > 0) {
                try {
                    entity[field.name] = new Date(data[field.name])
                } catch (error) {
                    console.error(error)
                }
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
                if (entity['id'] !== undefined) {
                    jsonData['id'] = entity['id']
                }

                fields.forEach(field => {
                    if (entity[field.name] !== undefined) {
                        jsonData[field.name] = entity[field.name]
                    }
                })
                return jsonData
            }
        }

        this.registerLoadedEntityMetadata(entity, docSnapshot.ref)
        this.attachSubCollectionsToEntity(entity, docSnapshot.ref)
        this.attachRefsToEntity(entity, data)

        if (typeof entity.init === 'function') {
            // @todo handle promises
            const result = entity.init()
            // if (result instanceof Promise) {
            //     await result
            // }
        }

        return entity
    }

    createEntity() {
        let entity = new this.entityConstructor()
        this.registerNewEntityMetadata(entity)

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
            if (data[fieldName] !== undefined) {
                entity[fieldName] = new Reference(docRefs[fieldName].entity, entity, DocReference.fromNativeRef(data[fieldName]))
            } else {
                entity[fieldName] = new Reference(docRefs[fieldName].entity, entity)
            }
        }
    }

    public getEntityFields(): PropertyMetadata[] {
        return this.metadata.fields
    }

    public getEntityDocRefs(): EntityDocRefsMetadata {
        return this.metadata.docRefs
    }

    public refreshNewEntity(entity: Entity, docReference: DocumentReference) {
        this.registerLoadedEntityMetadata(entity, docReference)
        this.attachSubCollectionsToEntity(entity, docReference)
    }

    public registerLoadedEntityMetadata(entity: Entity, nativeDocRef: DocumentReference) {
        const ormDocRef = DocReference.fromNativeRef(nativeDocRef)
        const mutationTracker = this.createMutationTracker(entity)
        const persister = new DocPersistenceManager<Entity>(nativeDocRef, this.collectionReference)
        const metadata: OrmMetadata<Entity> = {
            isNew: false,
            ormDocRef,
            nativeDocRef,
            mutationTracker,
            persister,
        }

        EntityManager.ormMetadataStore.set(entity, metadata)
    }

    public registerNewEntityMetadata(entity: Entity) {
        const mutationTracker = this.createMutationTracker(entity)
        const persister = new DocPersistenceManager<Entity>(null, this.collectionReference)
        const metadata: OrmMetadata<Entity> = {
            isNew: false,
            ormDocRef: null,
            nativeDocRef: null,
            mutationTracker,
            persister,
        }

        EntityManager.ormMetadataStore.set(entity, metadata)
    }

    protected createMutationTracker(entity: Entity) {
        return new MutationTracker(entity, this.metadata.fields)
    }
}

interface OrmMetadata<Entity> {
    isNew: boolean

    mutationTracker?: MutationTracker

    persister?: DocPersistenceManager<Entity>

    ormDocRef?: DocReference

    nativeDocRef?
}

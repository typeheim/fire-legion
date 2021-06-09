import {
    CollectionRefMetadata,
    DocRefMetadata,
    EntityMetadata,
    PropertyMetadata,
} from '../Contracts/EntityMetadata'

export class MetadataStorage {
    protected metadataMap = new Map<any, EntityMetadata>()

    entity(target) {
        return {
            add: (metadata: EntityMetadata) => {
                this.add(target, metadata)
            },

            addField: (fieldMetadata: PropertyMetadata) => {
                this.addField(target, fieldMetadata)
            },

            addCollectionRef: (subCollectionMetadata: CollectionRefMetadata) => {
                this.addCollectionRef(target, subCollectionMetadata)
            },

            addDocRef: (refMetadata: DocRefMetadata) => {
                this.addDocRef(target, refMetadata)
            },

            setRepository: (repository) => {
                this.setRepository(target, repository)
            },

            get: () => {
                return this.get(target)
            },
        }
    }

    protected get(target): EntityMetadata {
        return this.metadataMap.get(target)
    }

    protected add(target, metadata: EntityMetadata) {
        this.ensureMetadataExistForTarget(target)
        if (metadata.collection) {
            this.metadataMap.get(target).collection = metadata.collection
        }
        if (metadata.fields) {
            this.metadataMap.get(target).fields = metadata.fields
        }
    }

    protected addField(target, metadata: PropertyMetadata) {
        this.ensureMetadataExistForTarget(target)
        this.metadataMap.get(target).fields.push(metadata)
    }

    protected addCollectionRef(target, metadata: CollectionRefMetadata) {
        this.ensureMetadataExistForTarget(target)
        this.metadataMap.get(target).collectionRefs.push(metadata)
    }

    protected addDocRef(target, metadata: DocRefMetadata) {
        this.ensureMetadataExistForTarget(target)
        this.metadataMap.get(target).docRefs[metadata.fieldName] = metadata
    }

    protected setRepository(target, repository) {
        this.ensureMetadataExistForTarget(target)
        this.metadataMap.get(target).repository = repository
    }

    protected ensureMetadataExistForTarget(target) {
        if (!this.metadataMap.has(target)) {
            this.metadataMap.set(target, {
                collection: '',
                repository: null,
                fields: [],
                collectionRefs: [],
                docRefs: {},
            })
        }
    }
}

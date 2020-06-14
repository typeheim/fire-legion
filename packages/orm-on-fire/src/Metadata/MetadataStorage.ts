import {
    CollectionRefMetadata,
    DocRefMetadata,
    EntityMetadata,
    PropertyMetadata,
} from '../Contracts/EntityMetadata'

export class MetadataStorage {
    protected metadataMap: MetadataMap = {}

    entity(target) {
        return {
            add: (metadata: EntityMetadata) => {
                this.add(target.prototype.constructor.name, metadata)
            },

            addField: (fieldMetadata: PropertyMetadata) => {
                this.addField(target.constructor.name, fieldMetadata)
            },

            addCollectionRef: (subCollectionMetadata: CollectionRefMetadata) => {
                this.addCollectionRef(target.constructor.name, subCollectionMetadata)
            },

            addDocRef: (refMetadata: DocRefMetadata) => {
                this.addDocRef(target.constructor.name, refMetadata)
            },

            setRepository: (repository) => {
                this.setRepository(target.constructor.name, repository)
            },

            get: () => {
                return this.get(target.prototype.constructor.name)
            },
        }
    }

    protected get(target): EntityMetadata {
        return this.metadataMap[target]
    }

    protected add(target, metadata: EntityMetadata) {
        this.ensureMetadataExistForTarget(target)
        if (metadata.collection) {
            this.metadataMap[target].collection = metadata.collection
        }
        if (metadata.fields) {
            this.metadataMap[target].fields = metadata.fields
        }
    }

    protected addField(target, metadata: PropertyMetadata) {
        this.ensureMetadataExistForTarget(target)
        this.metadataMap[target].fields.push(metadata)
    }

    protected addCollectionRef(target, metadata: CollectionRefMetadata) {
        this.ensureMetadataExistForTarget(target)
        this.metadataMap[target].collectionRefs.push(metadata)
    }

    protected addDocRef(target, metadata: DocRefMetadata) {
        this.ensureMetadataExistForTarget(target)
        this.metadataMap[target].docRefs[metadata.fieldName] = metadata
    }

    protected setRepository(target, repository) {
        this.ensureMetadataExistForTarget(target)
        this.metadataMap[target].repository = repository
    }

    protected ensureMetadataExistForTarget(target) {
        if (!this.metadataMap.hasOwnProperty(target)) {
            this.metadataMap[target] = {
                collection: '',
                repository: null,
                fields: [],
                collectionRefs: [],
                docRefs: {},
            }
        }
    }
}

interface MetadataMap {
    [key: string]: EntityMetadata
}

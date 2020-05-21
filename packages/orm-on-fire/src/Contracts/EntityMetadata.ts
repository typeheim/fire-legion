export interface EntityMetadata {
    collection: string
    repository?: any
    fields?: PropertyMetadata[]
    collectionRefs?: CollectionRefMetadata[]
    docRefs?: {
        [key: string]: DocRefMetadata
    }
}

export interface PropertyMetadata {
    name: string
}

export interface CollectionRefMetadata {
    entity: any
    fieldName: string
}

export interface DocRefMetadata {
    entity: any
    fieldName: string
}


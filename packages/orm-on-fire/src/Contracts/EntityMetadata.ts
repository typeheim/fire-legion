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
    isText?: boolean
    isDate?: boolean
    isMap?: boolean
    constructor?: any
    updateOnSave?: boolean
    generateOnCreate?: boolean
}

export interface CollectionRefMetadata {
    entity: any
    fieldName: string
}

export interface DocRefMetadata {
    entity: any
    fieldName: string
}


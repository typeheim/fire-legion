import { CollectionMap } from './Model/CollectionMap'
import { FirestoreConnection } from './Persistence/FirestoreConnection'
import { MetadataStorage } from './Metadata/MetadataStorage'
import { Factory } from './Model/CollectionFactory'

export const Metadata = new MetadataStorage()
export const OrmOnFire = new FirestoreConnection()
export const CollectionFactory = new Factory(OrmOnFire, Metadata)
export const InternalCollectionsMap = new CollectionMap(CollectionFactory)

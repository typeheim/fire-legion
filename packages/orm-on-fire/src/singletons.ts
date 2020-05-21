import { RepositoryMap } from './Model/RepositoryMap'
import { FirestoreConnection } from './Persistence/FirestoreConnection'
import { MetadataStorage } from './Metadata/MetadataStorage'

export const Metadata = new MetadataStorage()
export const OrmOnFire = new FirestoreConnection()
export const Repo = new RepositoryMap(OrmOnFire)

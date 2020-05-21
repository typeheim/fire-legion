import { GenericRepository } from './GenericRepository'
import { EntityType } from '../Contracts/EntityType'
import { Metadata } from '../singletons'
import { FirestoreConnection } from '../Persistence/FirestoreConnection'

export class RepositoryMap {
    protected storage: RepoStorage = {}

    constructor(protected connection: FirestoreConnection) {}

    of<Entity>(entity: EntityType<Entity>): GenericRepository<Entity> {
        const entityClassName = entity.prototype.constructor.name
        if (!this.storage.hasOwnProperty(entityClassName)) {
            this.initRepositoryForEntity<Entity>(entity)
        }

        return this.storage[entityClassName]
    }

    protected initRepositoryForEntity<Entity>(entity: EntityType<Entity>) {
        const metadata = Metadata.entity(entity).get()
        const entityClassName = entity.prototype.constructor.name

        if (metadata.repository) {
            // @ts-ignore
            this.storage[entityClassName] = new metadata.repository<Entity>(metadata, entity, this.connection.collectionRef(metadata.collection))
        } else {
            this.storage[entityClassName] = new GenericRepository<Entity>(metadata, entity, this.connection.collectionRef(metadata.collection))
        }
    }
}

interface RepoStorage {
    [key: string]: GenericRepository<any>;
}

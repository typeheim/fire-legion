import { CollectionReference } from './CollectionReference'
import { EntityManager } from './EntityManager'
import { EntityQuery } from './EntityQuery'
import { CollectionQuery } from './CollectionQuery'
import { EntityMetadata } from '../Contracts/EntityMetadata'

export class QueryFactory<Entity> {
    constructor(protected collectionReference: CollectionReference, protected entityManager: EntityManager<Entity>, protected metadata: EntityMetadata) {}

    public createEntityQuery(id: string): EntityQuery<Entity> {
        return new EntityQuery<Entity>(this.collectionReference.doc(id), this.entityManager)
    }

    public createCollectionQuery(): CollectionQuery<Entity> {
        return new CollectionQuery<Entity>(this.collectionReference, this.entityManager, this.metadata.fields)
    }
}

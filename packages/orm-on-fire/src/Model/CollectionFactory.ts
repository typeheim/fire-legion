import { Collection } from './Collection'
import { EntityPersister } from './EntityPersister'
import { FirestoreConnection } from '../Persistence/FirestoreConnection'
import { EntityType } from '../Contracts/EntityType'
import { QueryFactory } from '../Persistence/QueryFactory'
import { EntityManager } from '../Persistence/EntityManager'
import { CollectionReference } from '../Persistence/CollectionReference'
import * as types from '@firebase/firestore-types'
import { MetadataStorage } from '../Metadata/MetadataStorage'
import { NullCollection } from './NullCollection'
import DocumentReference = types.DocumentReference

export class Factory {
    constructor(protected connection: FirestoreConnection, protected metadata: MetadataStorage) {}

    createNullCollection() {
        return new NullCollection()
    }

    createGroupFor<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        const metadata = this.metadata.entity(entity).get()

        // @ts-ignore
        return this.create(entity, this.connection.collectionGroupRef(metadata.collection), metadata)
    }

    createFor<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        const metadata = this.metadata.entity(entity).get()

        return this.create(entity, this.connection.collectionRef(metadata.collection), metadata)
    }

    createWithRef<Entity>(entity: EntityType<Entity>, docReference: DocumentReference) {
        const metadata = this.metadata.entity(entity).get()
        let collectionRef = new CollectionReference(this.connection, `${docReference.path}/${metadata.collection}`)

        return this.create(entity, collectionRef, metadata)
    }

    createFromBasePath<Entity>(entity: EntityType<Entity>, path: string) {
        const metadata = this.metadata.entity(entity).get()
        let collectionRef = new CollectionReference(this.connection, `${path}/${metadata.collection}`)

        return this.create(entity, collectionRef, metadata)
    }

    protected create<Entity>(entity: EntityType<Entity>, collectionRef: CollectionReference, metadata) {
        let entityManager = new EntityManager<Entity>(metadata, entity, collectionRef)
        let queryFactory = new QueryFactory(collectionRef, entityManager, metadata)

        return new Collection(queryFactory, new EntityPersister<Entity>(entityManager))
    }
}



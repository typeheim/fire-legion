import { EntityQuery } from '../Persistence/EntityQuery'
import { EntityMetadata } from '../Contracts/EntityMetadata'
import { EntityManager } from '../Persistence/EntityManager'
import { Model } from '../Contracts/Model'
import { CollectionQuery } from '../Persistence/CollectionQuery'
import { ReactivePromise } from '@typeheim/fire-rx'
import { CollectionReference } from '../Persistence/CollectionReference'

export class GenericRepository<Entity extends Model> {
    protected _entityManager: EntityManager<Entity>

    constructor(protected metadata: EntityMetadata, protected entityConstructor, protected collectionReference: CollectionReference) {}

    public new(id?: string): ReactivePromise<Entity> {
        let entity = this.entityManager.createEntity(this.collectionReference)
        if (entity) {
            entity.id = id
        }
        let promise = new ReactivePromise<Entity>()

        this.save(entity).subscribe(result => {
            promise.resolve(entity)
        })

        return promise
    }

    public one(id: string): EntityQuery<Entity> {
        return new EntityQuery<Entity>(this.collectionReference.doc(id), this.entityManager)
    }

    public all(): CollectionQuery<Entity> {
        return new CollectionQuery<Entity>(this.collectionReference, this.entityManager, this.metadata)
    }

    public save(entity: Entity): ReactivePromise<void> {
        if (!entity['__ormOnFire']) {
            this.entityManager.attachMetadataToNewEntity(entity, this.collectionReference)
        }
        return entity.__ormOnFire.save()
    }

    public remove(entity: Entity): ReactivePromise<void> {
        if (!entity['__ormOnFire']) {
            // @todo add exception to indicate new entity being deleted
        }
        return entity.__ormOnFire.remove()
    }

    protected get entityManager() {
        if (!this._entityManager) {
            this._entityManager = new EntityManager<Entity>(this.metadata, this, this.entityConstructor)
        }
        return this._entityManager
    }
}

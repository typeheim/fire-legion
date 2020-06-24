import { EntityManager } from '../Persistence/EntityManager'
import { Model } from '../Contracts/Model'
import { ReactivePromise } from '@typeheim/fire-rx'

export class EntityPersister<Entity extends Model> {
    constructor(protected entityManager: EntityManager<Entity>) {}

    public new(id?: string): ReactivePromise<Entity> {
        let entity = this.entityManager.createEntity()
        if (entity) {
            entity.id = id
        }
        let promise = new ReactivePromise<Entity>()

        this.save(entity).subscribe(result => {
            promise.resolve(entity)
        })

        return promise
    }

    public save(entity: Entity): ReactivePromise<void> {
        if (!entity['__ormOnFire']) {
            this.entityManager.attachMetadataToNewEntity(entity)
        }
        return entity.__ormOnFire.save()
    }

    public remove(entity: Entity): ReactivePromise<void> {
        if (!entity['__ormOnFire']) {
            // @todo add exception to indicate new entity being deleted
        }
        return entity.__ormOnFire.remove()
    }
}

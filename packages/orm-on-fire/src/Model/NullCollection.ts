import {
    ReactivePromise,
    StatefulSubject,
} from '@typeheim/fire-rx'
import { ChangedEntities } from '../Data/ChangedEntities'
import { EntityQuery } from '../Persistence/EntityQuery'
import { FilterFunction } from '../Contracts'
import { CollectionQuery } from '../Persistence/CollectionQuery'
import { EntityNotSavedException } from '../Exceptions/EntityNotSavedException'

export class NullCollection<Entity> {
    constructor() {}

    all(): CollectionQuery<Entity> {
        throw EntityNotSavedException.withMessage('Entity must be saved prior to using sub-collections')
    }

    one(id: string): EntityQuery<Entity> {
        throw EntityNotSavedException.withMessage('Entity must be saved prior to using sub-collections')
    }

    new(id?: string): ReactivePromise<Entity> {
        throw EntityNotSavedException.withMessage('Entity must be saved prior to using sub-collections')
    }

    save(entity: Entity): ReactivePromise<void> {
        throw EntityNotSavedException.withMessage('Entity must be saved prior to using sub-collections')
    }

    remove(entity: Entity): ReactivePromise<void> {
        throw EntityNotSavedException.withMessage('Entity must be saved prior to using sub-collections')
    }

    filter(filterFunction: FilterFunction<Entity>): CollectionQuery<Entity> {
        throw EntityNotSavedException.withMessage('Entity must be saved prior to using sub-collections')
    }

    changes(): StatefulSubject<ChangedEntities<Entity>> {
        throw EntityNotSavedException.withMessage('Entity must be saved prior to using sub-collections')
    }

    forEach(callback: ((value: Entity) => void)): StatefulSubject<Entity[]> {
        throw EntityNotSavedException.withMessage('Entity must be saved prior to using sub-collections')
    }

    clean() {
        throw EntityNotSavedException.withMessage('Entity must be saved prior to using sub-collections')
    }
}

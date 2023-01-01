import { EntityStore } from './EntityStore'
import {
    AsyncStream,
    ReactivePromise,
    StatefulSubject,
} from '@typeheim/fire-rx'
import { ChangedEntities } from '../Data/ChangedEntities'
import { EntityQuery } from '../Persistence/EntityQuery'
import {
    EntityType,
    FilterFunction,
} from '../Contracts'
import { CollectionQuery } from '../Persistence/CollectionQuery'
import { QueryFactory } from '../Persistence/QueryFactory'
import { InternalCollectionsMap } from '../singletons'
import { EntityStream } from '../Data/EntityStream'
import { map } from 'rxjs/operators'

export class Collection<Entity> {
    constructor(protected queryFactory: QueryFactory<Entity>, protected entityStore: EntityStore<Entity>) {}

    static of<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        return InternalCollectionsMap.of(entity)
    }

    static groupOf<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        return InternalCollectionsMap.groupOf(entity)
    }

    all(): CollectionQuery<Entity> {
        return this.queryFactory.createCollectionQuery()
    }

    one(id: string): EntityQuery<Entity> {
        return this.queryFactory.createEntityQuery(id)
    }

    new(id?: string): ReactivePromise<Entity> {
        return this.entityStore.new(id)
    }

    save(entity: Entity): ReactivePromise<boolean> {
        return this.entityStore.save(entity)
    }

    remove(entity: Entity): ReactivePromise<boolean> {
        return this.entityStore.remove(entity)
    }

    filter(filterFunction: FilterFunction<Entity>): CollectionQuery<Entity> {
        return this.queryFactory.createCollectionQuery().filter(filterFunction)
    }

    changes(): EntityStream<ChangedEntities<Entity>> {
        return this.queryFactory.createCollectionQuery().changes()
    }

    forEach(callback: ((value: Entity) => void)): AsyncStream<any> {
        return new AsyncStream(this.all().get().pipe(map(entities => {
            entities.forEach(entity => {
                callback(entity)
            })
        })))
    }

    clean() {
        let subject = new StatefulSubject(1)

        this.all().get().subscribe((entities: Entity[]) => {
            entities.forEach(entity => {
                this.entityStore.remove(entity)
            })
            subject.next(true)
            subject.complete()
        })

        return subject
    }
}

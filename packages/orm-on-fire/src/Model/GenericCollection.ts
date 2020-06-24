import { EntityPersister } from './EntityPersister'
import {
    ReactivePromise,
    StatefulStream,
} from '@typeheim/fire-rx'
import { ChangedEntities } from '../Data/ChangedEntities'
import { EntityQuery } from '../Persistence/EntityQuery'
import { FilterFunction } from '../Contracts'
import { CollectionQuery } from '../Persistence/CollectionQuery'
import { QueryFactory } from '../Persistence/QueryFactory'

export class GenericCollection<Entity> {
    constructor(protected queryFactory: QueryFactory<Entity>, protected persister: EntityPersister<Entity>) {}

    all(): CollectionQuery<Entity> {
        return this.queryFactory.createCollectionQuery()
    }

    one(id: string): EntityQuery<Entity> {
        return this.queryFactory.createEntityQuery(id)
    }

    new(id?: string): ReactivePromise<Entity> {
        return this.persister.new(id)
    }

    save(entity: Entity): ReactivePromise<void> {
        return this.persister.save(entity)
    }

    remove(entity: Entity): ReactivePromise<void> {
        return this.persister.remove(entity)
    }

    filter(filterFunction: FilterFunction<Entity>): CollectionQuery<Entity> {
        return this.queryFactory.createCollectionQuery().filter(filterFunction)
    }

    changes(): StatefulStream<ChangedEntities<Entity>> {
        return this.queryFactory.createCollectionQuery().changes()
    }

    forEach(callback: ((value: Entity) => void)): StatefulStream<Entity[]> {
        let subject = this.all().get()
        subject.subscribe(entities => {
            entities.forEach(entity => {
                callback(entity)
            })
        })
        return subject
    }

    clean() {
        let subject = new StatefulStream(1)

        this.all().get().subscribe((entities: Entity[]) => {
            entities.forEach(entity => {
                this.persister.remove(entity)
            })
            subject.next(true)
            subject.complete()
        })

        return subject
    }
}

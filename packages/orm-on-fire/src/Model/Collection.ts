import { GenericRepository } from './GenericRepository'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { ChangedEntities } from '../Data/ChangedEntities'
import { EntityQuery } from '../Persistence/EntityQuery'
import { EntityType, FilterFunction } from '../Contracts'
import { CollectionQuery } from '../Persistence/CollectionQuery'
import { Repo } from '../singletons'

export class Collection<Entity> {
    constructor(protected repository: GenericRepository<Entity>) {}

    static of<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        return new Collection<Entity>(Repo.of(entity))
    }

    all(): CollectionQuery<Entity> {
        return this.repository.all()
    }

    one(id: string): EntityQuery<Entity> {
        return this.repository.one(id)
    }

    new(id?: string): FireReplaySubject<Entity> {
        return this.repository.new(id)
    }

    save(entity: Entity): FireReplaySubject<void> {
        return this.repository.save(entity)
    }

    get changes(): FireReplaySubject<ChangedEntities<Entity>> {
        return this.repository.all().changesStream()
    }

    /**
     * @deprecated
     */
    get(): FireReplaySubject<Entity[]> {
        return this.repository.all().get()
    }

    /**
     * @deprecated
     */
    filter(filterFunction: FilterFunction<Entity>): CollectionQuery<Entity> {
        return this.repository.all().filter(filterFunction)
    }

    /**
     * @deprecated
     */
    changesStream(): FireReplaySubject<ChangedEntities<Entity>> {
        return this.repository.all().changesStream()
    }

    /**
     * @deprecated
     */
    dataStream(): FireReplaySubject<Entity[]> {
        return this.repository.all().dataStream()
    }

    forEach(callback: ((value: Entity) => void)): FireReplaySubject<Entity[]> {
        let subject = this.all().get()
        subject.subscribe(entities => {
            entities.forEach(entity => {
                callback(entity)
            })
        })
        return subject
    }

    clean() {
        let subject = new FireReplaySubject(1)

        this.all().get().subscribe((entities: Entity[]) => {
            entities.forEach(entity => {
                this.repository.remove(entity)
            })
            subject.next(true)
            subject.complete()
        })

        return subject
    }
}

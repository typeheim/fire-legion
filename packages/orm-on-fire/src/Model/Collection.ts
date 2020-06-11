import { GenericRepository } from './GenericRepository'
import { StatefulSubject } from '@typeheim/fire-rx'
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

    new(id?: string): StatefulSubject<Entity> {
        return this.repository.new(id)
    }

    save(entity: Entity): StatefulSubject<void> {
        return this.repository.save(entity)
    }

    remove(entity: Entity): StatefulSubject<void> {
        return this.repository.remove(entity)
    }

    filter(filterFunction: FilterFunction<Entity>): CollectionQuery<Entity> {
        return this.repository.all().filter(filterFunction)
    }

    get changes(): StatefulSubject<ChangedEntities<Entity>> {
        return this.repository.all().changes()
    }

    /**
     * @deprecated
     */
    get(): StatefulSubject<Entity[]> {
        return this.repository.all().get()
    }



    /**
     * @deprecated in favor of {changes}
     */
    changesStream(): StatefulSubject<ChangedEntities<Entity>> {
        return this.repository.all().changes()
    }

    /**
     * @deprecated
     */
    dataStream(): StatefulSubject<Entity[]> {
        return this.repository.all().stream()
    }

    forEach(callback: ((value: Entity) => void)): StatefulSubject<Entity[]> {
        let subject = this.all().get()
        subject.subscribe(entities => {
            entities.forEach(entity => {
                callback(entity)
            })
        })
        return subject
    }

    clean() {
        let subject = new StatefulSubject(1)

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

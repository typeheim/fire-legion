import { GenericRepository } from './GenericRepository'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { ChangedEntities } from '../Data/ChangedEntities'
import { EntityQuery } from '../Persistence/EntityQuery'
import { FilterFunction } from '../Contracts'
import { CollectionQuery } from '../Persistence/CollectionQuery'

export class Collection<Entity> {
    constructor(protected repository: GenericRepository<Entity>) {}

    one(id: string): EntityQuery<Entity> {
        return this.repository.one(id)
    }

    get(): FireReplaySubject<Entity[]> {
        return this.repository.all().get()
    }

    filter(filterFunction: FilterFunction<Entity>): CollectionQuery<Entity> {
        return this.repository.all().filter(filterFunction)
    }

    changesStream(): FireReplaySubject<ChangedEntities<Entity>> {
        return this.repository.all().changesStream()
    }

    dataStream(): FireReplaySubject<Entity[]> {
        return this.repository.all().dataStream()
    }

    forEach(callback: ((value: Entity) => void)): FireReplaySubject<Entity[]> {
        let subject = this.get()
        subject.subscribe(entities => {
            entities.forEach(entity => {
                callback(entity)
            })
        })
        return subject
    }

    clean() {
        let subject = new FireReplaySubject(1)

        this.get().subscribe((entities: Entity[]) => {
            entities.forEach(entity => {
                this.repository.remove(entity)
            })
            subject.next(true)
            subject.complete()
        })

        return subject
    }
}

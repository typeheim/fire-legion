import { EntityManager } from './EntityManager'
import { DocReference } from './DocReference'
import { EntityStream } from '../Data/EntityStream'
import { EntityPromise } from '../Data/EntityPromise'
import { map } from 'rxjs/operators'
import {
    Collection,
    EntityType,
} from '@typeheim/orm-on-fire'
import { CollectionFactory } from '../singletons'

export class EntityQuery<Entity> {
    constructor(protected docReference: DocReference, protected entityBuilder: EntityManager<Entity>) {}

    get(): EntityPromise<Entity> {
        let promise = new EntityPromise<Entity>()

        if (this.docReference) {
            this.docReference.get().subscribe({
                next: (docSnapshot) => promise.resolve(this.entityBuilder.fromSnapshot(docSnapshot)),
                error: (error) => promise.reject(error),
            })
        } else {
            promise.resolve(null)
        }

        return promise
    }

    collection<RefEntity>(entity: EntityType<RefEntity>): Collection<RefEntity> {
        return CollectionFactory.createFromBasePath(entity, this.docReference.path)
    }

    stream(): EntityStream<Entity> {
        let snapshotStream = this.docReference.snapshot()
        let source = snapshotStream.pipe(map((docSnapshot) => {
            return this.entityBuilder.fromSnapshot(docSnapshot)
        }))

        return new EntityStream<Entity>(source, snapshotStream)
    }
}

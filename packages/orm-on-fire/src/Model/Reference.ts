import { EntityManager } from '../Persistence/EntityManager'
import { Metadata, Repo } from '../singletons'
import { EntityQuery } from '../Persistence/EntityQuery'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { DocReference } from '../Persistence/DocReference'

export class Reference<Entity> {
    protected _entityBuilder: EntityManager<Entity>

    constructor(protected entityConstructor, protected docRef: DocReference) {}

    get(): FireReplaySubject<Entity> {
        return new EntityQuery<Entity>(this.docRef, this.entityBuilder).get()
    }

    stream(): FireReplaySubject<Entity> {
        return new EntityQuery<Entity>(this.docRef, this.entityBuilder).stream()
    }

    protected get entityBuilder() {
        if (!this._entityBuilder) {
            this._entityBuilder = new EntityManager<Entity>(Metadata.entity(this.entityConstructor).get(), Repo.of(this.entityConstructor), this.entityConstructor)
        }
        return this._entityBuilder
    }

}

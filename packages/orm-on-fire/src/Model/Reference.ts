import { EntityManager } from '../Persistence/EntityManager'
import { Metadata, Repo } from '../singletons'
import { EntityQuery } from '../Persistence/EntityQuery'
import { StatefulSubject } from '@typeheim/fire-rx'
import { DocReference } from '../Persistence/DocReference'
import { Model } from '../Contracts'
import { save } from '../operators'

export class Reference<Entity> {
    protected _entityBuilder: EntityManager<Entity>
    protected docRef: DocReference

    constructor(protected entityConstructor, protected owner) {}

    link(reference: Entity | Model): StatefulSubject<void> {
        // @ts-ignore
        this.docRef = reference?.__ormOnFire?.docRef
        return save(this.owner)
    }

    get(): StatefulSubject<Entity> {
        return new EntityQuery<Entity>(this.docRef, this.entityBuilder).get()
    }

    stream(): StatefulSubject<Entity> {
        return new EntityQuery<Entity>(this.docRef, this.entityBuilder).stream()
    }

    protected get entityBuilder() {
        if (!this._entityBuilder) {
            this._entityBuilder = new EntityManager<Entity>(Metadata.entity(this.entityConstructor).get(), Repo.of(this.entityConstructor), this.entityConstructor)
        }
        return this._entityBuilder
    }

    ___attachDockRef(docRef: DocReference) {
        this.docRef = docRef
    }

    get ___docReference() {
        return this.docRef
    }
}

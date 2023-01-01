import { EntityManager } from '../Persistence/EntityManager'
import { Metadata } from '../singletons'
import { EntityQuery } from '../Persistence/EntityQuery'
import { ReactivePromise } from '@typeheim/fire-rx'
import { DocReference } from '../Persistence/DocReference'
import { CollectionReference } from '../Persistence/CollectionReference'
import { Model } from '../Contracts'
import { save } from '../operators'
import { EntityPromise } from '../Data/EntityPromise'
import { EntityStream } from '../Data/EntityStream'

export class Reference<Entity> {
    protected _entityBuilder: EntityManager<Entity>

    constructor(protected entityConstructor, protected owner: Model, protected docRef?: DocReference) {
    }

    link(reference: Entity | Model): ReactivePromise<boolean> {
        // @ts-ignore
        this.docRef = reference?.__ormOnFire?.docRef

        let result: ReactivePromise<boolean>

        if (this.owner?.__ormOnFire === undefined || this.owner?.__ormOnFire?.isNew) {
            result = new ReactivePromise<boolean>()
            result.resolve()
        } else {
            result = save(this.owner)
        }
        return result
    }

    get(): EntityPromise<Entity> {
        return new EntityQuery<Entity>(this.docRef, this.entityBuilder).get()
    }

    stream(): EntityStream<Entity> {
        return new EntityQuery<Entity>(this.docRef, this.entityBuilder).stream()
    }

    protected get entityBuilder() {
        if (!this._entityBuilder) {
            // @todo move outside of Reference
            let metadata = Metadata.entity(this.entityConstructor).get()
            let collectionPath = `${this.owner?.__ormOnFire?.docRef.nativeRef.path}/${metadata.collection}`
            this._entityBuilder = new EntityManager<Entity>(metadata, this.entityConstructor, new CollectionReference(this.entityConstructor, collectionPath))
        }
        return this._entityBuilder
    }

    get ___docReference() {
        return this.docRef
    }
}

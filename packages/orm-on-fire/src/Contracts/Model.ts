import { EntityPersister } from '../Model/EntityPersister'
import { ReactivePromise } from '@typeheim/fire-rx'
import { DocReference } from '../Persistence/DocReference'
import { MutationTracker } from '../Persistence/EntityManager'

export interface Model {
    id?: string

    __ormOnFire?: OrmMetadata

    [key: string]: any

    toJSON?()
}

interface OrmMetadata {
    isNew: boolean

    mutation?: MutationTracker

    repository?: EntityPersister<any>

    docRef?: DocReference

    save?(): ReactivePromise<void>

    remove?(): ReactivePromise<void>
}

import { GenericRepository } from '../Model/GenericRepository'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { DocReference } from '../Persistence/DocReference'

export interface Model {
    id?: string
    __ormOnFire?: OrmMetadata

    [key: string]: any

    toJSON?()
}

interface OrmMetadata {
    repository?: GenericRepository<any>

    docRef?: DocReference

    save?(): FireReplaySubject<void>

    remove?(): FireReplaySubject<void>
}

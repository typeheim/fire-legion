import { GenericRepository } from '../Model/GenericRepository'
import { FireReplaySubject } from '@typeheim/fire-rx'

export interface Model {
    id?: string
    __ormOnFire?: OrmMetadata

    [key: string]: any

    toJSON?()
}

interface OrmMetadata {
    repository?: GenericRepository<any>

    save?(): FireReplaySubject<void>

    remove?(): FireReplaySubject<void>
}

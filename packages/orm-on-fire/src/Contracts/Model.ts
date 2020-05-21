import { GenericRepository } from '../Model/GenericRepository'
import { WriteResult } from '@google-cloud/firestore'
import { FireReplaySubject } from '@typeheim/fire-rx'

export interface Model {
    id?: string
    __ormOnFire?: OrmMetadata

    [key: string]: any

    toJSON?()
}

interface OrmMetadata {
    repository?: GenericRepository<any>

    save?(): FireReplaySubject<WriteResult>

    remove?(): FireReplaySubject<WriteResult>
}

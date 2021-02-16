import { ReactivePromise } from '@typeheim/fire-rx'
// Firestore types
import * as types from '@firebase/firestore-types'
import { MutationTracker } from './EntityManager'
import DocumentReference = types.DocumentReference

export class DocPersistenceManager<Entity> {
    constructor(protected docReference: DocumentReference) {}

    update(dataToSave: any, mutationTracker: MutationTracker): ReactivePromise<boolean> {
        let promise = new ReactivePromise<boolean>()
        this.docReference.update(dataToSave).then(() => {
            mutationTracker.refreshEntity()
            promise.resolve(true)
        }).catch(error => {
            promise.reject(error)
        })

        return promise
    }

    remove(): ReactivePromise<boolean> {
        let promise = new ReactivePromise<boolean>()
        this.docReference.delete().then(() => {
            promise.resolve(true)
        }).catch(error => {
            promise.reject(error)
        })

        return promise
    }
}

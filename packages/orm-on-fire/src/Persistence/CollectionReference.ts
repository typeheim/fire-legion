import { FirestoreConnection } from './FirestoreConnection'
import {
    ReactivePromise,
    StatefulSubject,
} from '@typeheim/fire-rx'
import { DocReference } from './DocReference'
import {
    QueryState,
    SortOrder,
} from '../Contracts/Query'
// Firestore types
import * as types from '@firebase/firestore-types'
import QuerySnapshot = types.QuerySnapshot
import Query = types.Query
import { EntityStream } from '../Data/EntityStream'

export class CollectionReference {
    constructor(protected connection: FirestoreConnection, protected collectionPath: string) {}

    get(queryState?: QueryState): ReactivePromise<QuerySnapshot> {
        let promise = new ReactivePromise<QuerySnapshot>()

        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.buildQuery(queryState).get().then((snapshot: QuerySnapshot) => {
                    promise.resolve(snapshot)
                }).catch(error => promise.reject(error))
            }
        })

        return promise
    }

    snapshot(queryState?: QueryState): StatefulSubject<QuerySnapshot> {
        let subject = new StatefulSubject<QuerySnapshot>()


        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.buildQuery(queryState).onSnapshot(
                    snapshot => subject.next(snapshot),
                    error => subject.fail(error),
                    () => subject.complete(),
                )
            }
        })

        return subject
    }

    protected buildQuery(queryState?: QueryState): Query {
        let collection = this.connection.driver.collection(this.collectionPath)
        let query: any = collection
        if (queryState) {
            if (queryState.conditions?.length > 0) {
                queryState.conditions.forEach(condition => {
                    query = query.where(condition.fieldName, condition.operator, condition.compareValue)
                })
            }

            if (queryState.orderBy?.length > 0) {
                queryState.orderBy.forEach(orderCondition => {
                    if (orderCondition.sortOrder === SortOrder.Descending) {
                        query = query.orderBy(orderCondition.field, 'desc')
                    } else {
                        query = query.orderBy(orderCondition.field)
                    }
                })
            }

            if (queryState.limit > 0) {
                query = query.limit(queryState.limit)
            }

            if (queryState.startAt !== undefined) {
                if (queryState.startAt?.__ormOnFire?.docRef) {
                    query = query.startAt(queryState.startAt?.__ormOnFire?.docRef?.nativeRef)
                } else {
                    query = query.startAt(queryState.startAt)
                }
            }
            if (queryState.startAfter !== undefined) {
                if (queryState.startAfter?.__ormOnFire?.docRef) {
                    query = query.startAfter(queryState.startAfter?.__ormOnFire?.docRef?.nativeRef)
                } else {
                    query = query.startAfter(queryState.startAfter)
                }
            }
            if (queryState.endAt !== undefined) {
                if (queryState.endAt?.__ormOnFire?.docRef) {
                    query = query.endAt(queryState.endAt?.__ormOnFire?.docRef?.nativeRef)
                } else {
                    query = query.endAt(queryState.endAt)
                }
            }
            if (queryState.endBefore !== undefined) {
                if (queryState.endBefore?.__ormOnFire?.docRef) {
                    query = query.endBefore(queryState.endBefore?.__ormOnFire?.docRef?.nativeRef)
                } else {
                    query = query.endBefore(queryState.endBefore)
                }
            }
        }

        return query
    }

    doc(docPath?: string) {
        return new DocReference(this.connection, docPath, this.collectionPath)
    }
}

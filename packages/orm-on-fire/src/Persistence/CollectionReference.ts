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
import {
    query,
    where,
    limit,
    orderBy,

    startAfter,
    endBefore,

    startAt,
    endAt,

    Query,
    getDocs,
    onSnapshot,
    collection,
    collectionGroup,
    QuerySnapshot
} from 'firebase/firestore'


export enum CollectionRefType {
    Basic,
    Group
}

export class CollectionReference {
    constructor(protected connection: FirestoreConnection, protected collectionPath: string, protected type: CollectionRefType = CollectionRefType.Basic) {}

    get(queryState?: QueryState): ReactivePromise<QuerySnapshot> {
        let promise = new ReactivePromise<QuerySnapshot>()

        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                getDocs(this.buildQuery(queryState)).then((snapshot) => {
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
                const unsub = onSnapshot(this.buildQuery(queryState),
                    snapshot => subject.next(snapshot),
                    error => subject.error(error),
                    () => subject.complete(),
                )
            }

        })

        return subject
    }

    protected buildQuery<T = any>(queryState?: QueryState) {
        const collection = this.buildNativeCollection()

        let constraints = []

        if (queryState) {
            if (queryState.conditions?.length > 0) {
                queryState.conditions.forEach(condition => {
                    constraints.push(where(condition.fieldName, condition.operator, condition.compareValue))
                })
            }

            if (queryState.orderBy?.length > 0) {
                queryState.orderBy.forEach(orderCondition => {
                    if (orderCondition.sortOrder === SortOrder.Descending) {
                        constraints.push(orderBy(orderCondition.field, 'desc'))
                    } else {
                        constraints.push(orderBy(orderCondition.field))
                    }
                })
            }

            if (queryState.limit > 0) {
                constraints.push(limit(queryState.limit))
            }

            if (queryState.startAt !== undefined) {
                if (queryState.startAt?.__ormOnFire?.docRef) {
                    constraints.push(startAt(queryState.startAt?.__ormOnFire?.docRef?.nativeRef))
                } else {
                    constraints.push(startAt(queryState.startAt))
                }
            }
            if (queryState.startAfter !== undefined) {
                if (queryState.startAfter?.__ormOnFire?.docRef) {
                    constraints.push(startAfter(queryState.startAfter?.__ormOnFire?.docRef?.nativeRef))
                } else {
                    constraints.push(startAfter(queryState.startAfter))
                }
            }
            if (queryState.endAt !== undefined) {
                if (queryState.endAt?.__ormOnFire?.docRef) {
                    constraints.push(endAt(queryState.endAt?.__ormOnFire?.docRef?.nativeRef))
                } else {
                    constraints.push(endAt(queryState.endAt))
                }
            }
            if (queryState.endBefore !== undefined) {
                if (queryState.endBefore?.__ormOnFire?.docRef) {
                    constraints.push(endBefore(queryState.endBefore?.__ormOnFire?.docRef?.nativeRef))
                } else {
                    constraints.push(endBefore(queryState.endBefore))
                }
            }
        }

        return query(collection, ...constraints)
    }

    buildNativeCollection() {
        return this.type === CollectionRefType.Basic ?
            collection(this.connection.driver, this.collectionPath) :
            collectionGroup(this.connection.driver, this.collectionPath)
    }

    doc(docPath?: string) {
        return new DocReference(this.connection, docPath, this.collectionPath)
    }
}

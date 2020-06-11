import { FirestoreConnection } from './FirestoreConnection'
import { StatefulSubject } from '@typeheim/fire-rx'
import { DocReference } from './DocReference'
import { QueryState } from '../Contracts/Query'
// Firestore types
import * as types from '@firebase/firestore-types'
import QuerySnapshot = types.QuerySnapshot
import Query = types.Query

export class CollectionReference {
    constructor(protected connection: FirestoreConnection, protected collectionPath: string) {}

    get(queryState?: QueryState): StatefulSubject<QuerySnapshot> {
        let subject = new StatefulSubject<QuerySnapshot>()

        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.buildQuery(queryState).get().then((snapshot: QuerySnapshot) => {
                    subject.next(snapshot)
                    subject.complete()
                })
            }
        })

        return subject
    }

    snapshot(queryState?: QueryState): StatefulSubject<QuerySnapshot> {
        let subject = new StatefulSubject<QuerySnapshot>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.buildQuery(queryState).onSnapshot(snapshot => {
                    subject.next(snapshot)
                })
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

            if (queryState.limit > 0) {
                query = query.limit(queryState.limit)
            }

        }

        return query
    }

    doc(docPath?: string) {
        return new DocReference(this.connection, docPath, this.collectionPath)
    }
}

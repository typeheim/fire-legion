import { FirestoreConnection } from './FirestoreConnection'
import {
    ReactivePromise,
    StatefulSubject,
} from '@typeheim/fire-rx'
import { OrmOnFire } from '../singletons'
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
    QuerySnapshot,

    doc,
    getDoc,
    setDoc,
    deleteDoc,

    DocumentReference,
    DocumentSnapshot
} from 'firebase/firestore'
export class DocReference {
    protected _nativeRef: DocumentReference

    constructor(protected connection: FirestoreConnection, protected docPath?: string, protected collectionPath?: string) {}

    static fromNativeRef(docRef: DocumentReference) {
        let doc = new DocReference(OrmOnFire)
        doc._nativeRef = docRef

        return doc
    }

    get(): StatefulSubject<DocumentSnapshot> {
        let subject = new StatefulSubject<DocumentSnapshot>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                getDoc(this.nativeRef).then((snapshot: DocumentSnapshot) => {
                    subject.next(snapshot)
                    subject.complete()
                }).catch(error => subject.error(error))
            }
        }).catch(error => subject.error(error))

        return subject
    }

    set(data): ReactivePromise<boolean> {
        let promise = new ReactivePromise<boolean>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                setDoc(this.nativeRef, data)
                    .then(() => promise.resolve(true))
                    .catch(() => promise.resolve(false))
            }
        }).catch(error => promise.reject(error))

        return promise
    }

    update(data): ReactivePromise<boolean> {
        let promise = new ReactivePromise<boolean>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                setDoc(this.nativeRef, data, {merge: true})
                    .then(() => promise.resolve(true))
                    .catch(() => promise.resolve(false))
            }
        }).catch(error => promise.reject(error))

        return promise
    }

    delete(): ReactivePromise<boolean> {
        let promise = new ReactivePromise<boolean>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                deleteDoc(this.nativeRef)
                    .then(() => promise.resolve(true))
                    .catch(() => promise.resolve(false))
            }
        }).catch(error => promise.reject(error))

        return promise
    }

    snapshot(): StatefulSubject<DocumentSnapshot> {
        let subject = new StatefulSubject<DocumentSnapshot>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                let unsubscribeSnapshot = onSnapshot(this.nativeRef,(snapshot: DocumentSnapshot) => {
                    subject.next(snapshot)
                })

                subject.subscribe({
                    complete: () => unsubscribeSnapshot(),
                })
            }
        }).catch(error => subject.error(error))

        return subject
    }

    get nativeRef() {
        if (!this._nativeRef) {
            this._nativeRef = doc(this.connection.driver, this.collectionPath, this.docPath)
        }
        return this._nativeRef
    }

    get path() {
        return this.collectionPath ? `${this.collectionPath}/${this.docPath}` : this.docPath
    }
}

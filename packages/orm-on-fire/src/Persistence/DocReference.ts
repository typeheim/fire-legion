import { FirestoreConnection } from './FirestoreConnection'
import {
    ReactivePromise,
    StatefulSubject,
} from '@typeheim/fire-rx'
import { OrmOnFire } from '../singletons'
// Firestore types
import * as types from '@firebase/firestore-types'
import DocumentReference = types.DocumentReference
import DocumentSnapshot = types.DocumentSnapshot

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
                this.nativeRef.get().then((snapshot: DocumentSnapshot) => {
                    subject.next(snapshot)
                    subject.complete()
                }).catch(error => subject.fail(error))
            }
        }).catch(error => subject.fail(error))

        return subject
    }

    set(data): ReactivePromise<boolean> {
        let promise = new ReactivePromise<boolean>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.set(data)
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
                this.nativeRef.update(data)
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
                this.nativeRef.delete()
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
                let unsubscribeSnapshot = this.nativeRef.onSnapshot((snapshot: DocumentSnapshot) => {
                    subject.next(snapshot)
                })

                subject.subscribe({
                    complete: () => unsubscribeSnapshot(),
                })
            }
        }).catch(error => subject.fail(error))

        return subject
    }

    get nativeRef() {
        if (!this._nativeRef) {
            let baseRef = this.collectionPath ? this.connection.driver.collection(this.collectionPath) : this.connection.driver
            // @ts-ignore
            this._nativeRef = this.docPath ? baseRef.doc(this.docPath) : baseRef.doc()
        }
        return this._nativeRef
    }
}

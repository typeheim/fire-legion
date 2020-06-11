import { FirestoreConnection } from './FirestoreConnection'
import { StatefulSubject } from '@typeheim/fire-rx'
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
                })
            }

        })

        return subject
    }

    set(data): StatefulSubject<boolean> {
        let subject = new StatefulSubject<boolean>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.set(data).then(() => {
                    subject.next()
                    subject.complete()
                })
            }
        })

        return subject
    }

    update(data): StatefulSubject<boolean> {
        let subject = new StatefulSubject<boolean>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.update(data).then(() => {
                    subject.next(true)
                    subject.complete()
                })
            }
        })

        return subject
    }

    delete(): StatefulSubject<boolean> {
        let subject = new StatefulSubject<boolean>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.delete().then(() => {
                    subject.next(true)
                    subject.complete()
                })
            }
        })

        return subject
    }

    snapshot(): StatefulSubject<DocumentSnapshot> {
        let subject = new StatefulSubject<DocumentSnapshot>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.onSnapshot((snapshot: DocumentSnapshot) => {
                    subject.next(snapshot)
                })
            }
        })

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

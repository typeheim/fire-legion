import { FirestoreConnection } from './FirestoreConnection'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { DocumentReference, DocumentSnapshot, WriteResult } from '@google-cloud/firestore'
import { OrmOnFire } from '../singletons'

export class DocReference {
    protected _nativeRef: DocumentReference

    constructor(protected connection: FirestoreConnection, protected docPath?: string, protected collectionPath?: string) {}

    static fromNativeRef(docRef: DocumentReference) {
        let doc = new DocReference(OrmOnFire)
        doc._nativeRef = docRef

        return doc
    }

    get(): FireReplaySubject<DocumentSnapshot> {
        let subject = new FireReplaySubject<DocumentSnapshot>()
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

    set(data): FireReplaySubject<WriteResult> {
        let subject = new FireReplaySubject<WriteResult>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.set(data).then((result: WriteResult) => {
                    subject.next(result)
                    subject.complete()
                })
            }
        })

        return subject
    }

    update(data): FireReplaySubject<WriteResult> {
        let subject = new FireReplaySubject<WriteResult>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.update(data).then((result: WriteResult) => {
                    subject.next(result)
                    subject.complete()
                })
            }
        })

        return subject
    }

    delete(): FireReplaySubject<WriteResult> {
        let subject = new FireReplaySubject<WriteResult>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.delete().then((result: WriteResult) => {
                    subject.next(result)
                    subject.complete()
                })
            }
        })

        return subject
    }

    snapshot(): FireReplaySubject<DocumentSnapshot> {
        let subject = new FireReplaySubject<DocumentSnapshot>()
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

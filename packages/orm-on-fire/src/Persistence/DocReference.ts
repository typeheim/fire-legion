import { FirestoreConnection } from './FirestoreConnection'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { firestore } from 'firebase/app';
import { OrmOnFire } from '../singletons'

export class DocReference {
    protected _nativeRef: firestore.DocumentReference

    constructor(protected connection: FirestoreConnection, protected docPath?: string, protected collectionPath?: string) {}

    static fromNativeRef(docRef: firestore.DocumentReference) {
        let doc = new DocReference(OrmOnFire)
        doc._nativeRef = docRef

        return doc
    }

    get(): FireReplaySubject<firestore.DocumentSnapshot> {
        let subject = new FireReplaySubject<firestore.DocumentSnapshot>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.get().then((snapshot: firestore.DocumentSnapshot) => {
                    subject.next(snapshot)
                    subject.complete()
                })
            }

        })

        return subject
    }

    set(data): FireReplaySubject<boolean> {
        let subject = new FireReplaySubject<boolean>()
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

    update(data): FireReplaySubject<boolean> {
        let subject = new FireReplaySubject<boolean>()
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

    delete(): FireReplaySubject<boolean> {
        let subject = new FireReplaySubject<boolean>()
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

    snapshot(): FireReplaySubject<firestore.DocumentSnapshot> {
        let subject = new FireReplaySubject<firestore.DocumentSnapshot>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.nativeRef.onSnapshot((snapshot: firestore.DocumentSnapshot) => {
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

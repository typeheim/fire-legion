import { FirestoreConnection } from './FirestoreConnection'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { firestore } from 'firebase/app';
import { DocReference } from './DocReference'


export class CollectionReference {
    constructor(protected connection: FirestoreConnection, protected collectionPath: string) {}

    get(): FireReplaySubject<firestore.QuerySnapshot> {
        let subject = new FireReplaySubject<firestore.QuerySnapshot>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.connection.driver.collection(this.collectionPath).get().then((snapshot: firestore.QuerySnapshot) => {
                    subject.next(snapshot)
                    subject.complete()
                })
            }
        })

        return subject
    }

    snapshot(): FireReplaySubject<firestore.QuerySnapshot> {
        let subject = new FireReplaySubject<firestore.QuerySnapshot>()
        this.connection.isInitialized.then((isInitialized: boolean) => {
            if (isInitialized) {
                this.connection.driver.collection(this.collectionPath).onSnapshot(snapshot => {
                    subject.next(snapshot)
                })
            }
        })

        return subject
    }

    doc(docPath?: string) {
        return new DocReference(this.connection, docPath, this.collectionPath)
    }
}

import { Firestore } from '@google-cloud/firestore'
import { FireReplaySubject } from '@typeheim/fire-rx'
import { CollectionReference } from './CollectionReference'
import { DocReference } from './DocReference'

export class FirestoreConnection {
    protected _driver: Firestore
    protected _isInitializedSubject = new FireReplaySubject<boolean>(1)

    set driver(driver: Firestore) {
        this._driver = driver
        this.isInitialized.next(true)
    }

    get driver(): Firestore {
        return this._driver
    }

    get isInitialized() {
        return this._isInitializedSubject
    }

    collectionReference(collectionPath: string) {
        return new CollectionReference(this, collectionPath)
    }

    docReference(docPath?: string) {
        return new DocReference(this, docPath)
    }
}

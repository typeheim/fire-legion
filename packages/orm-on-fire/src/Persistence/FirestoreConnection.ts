import { FireReplaySubject } from '@typeheim/fire-rx'
import { CollectionReference } from './CollectionReference'
import { DocReference } from './DocReference'
import { firestore } from 'firebase';

export class FirestoreConnection {
    /**
     * @type {firestore.Firestore}
     */
    protected _driver
    protected _isInitializedSubject = new FireReplaySubject<boolean>(1)

    /**
     * @param {firestore.Firestore} driver
     */
    set driver(driver) {
        this._driver = driver
        this.isInitialized.next(true)
    }

    /**
     * @return {firestore.Firestore}
     */
    get driver() {
        return this._driver
    }

    get isInitialized() {
        return this._isInitializedSubject
    }

    collectionRef(collectionPath: string) {
        return new CollectionReference(this, collectionPath)
    }

    docRef(docPath?: string) {
        return new DocReference(this, docPath)
    }
}

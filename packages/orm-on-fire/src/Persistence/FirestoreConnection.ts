import { ReactivePromise } from '@typeheim/fire-rx'
import {
    CollectionReference,
    CollectionRefType,
} from './CollectionReference'
import { DocReference } from './DocReference'
import { Firestore } from "firebase/firestore";

export class FirestoreConnection {
    /**
     * @type {Firestore}
     */
    protected _driver: Firestore

    protected _isInitializedSubject = new ReactivePromise<boolean>()

    set driver(driver) {
        this._driver = driver
        this.isInitialized.resolve(true)
    }

    get driver() {
        return this._driver
    }

    get isInitialized() {
        return this._isInitializedSubject
    }

    collectionRef(collectionPath: string) {
        return new CollectionReference(this, collectionPath)
    }

    collectionGroupRef(collectionPath: string) {
        return new CollectionReference(this, collectionPath, CollectionRefType.Group)
    }

    docRef(docPath?: string) {
        return new DocReference(this, docPath)
    }
}

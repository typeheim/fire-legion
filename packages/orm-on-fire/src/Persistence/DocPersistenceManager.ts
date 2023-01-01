import { ReactivePromise } from '@typeheim/fire-rx'

import { CollectionReference } from './CollectionReference'

import {
    DocumentReference,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    DocumentSnapshot,
    DocumentChange,
    QueryDocumentSnapshot,
    QuerySnapshot
} from "firebase/firestore";

export class DocPersistenceManager<Entity> {
    constructor(protected docReference: DocumentReference, protected collectionRef: CollectionReference) {}

    add(data: any, id?: string): ReactivePromise<DocumentReference> {
        const documentReference = id ? this.collectionRef.doc(id) : this.collectionRef.doc()
        const promise = new ReactivePromise<DocumentReference>()

        documentReference.set(data).then(() => {
            promise.resolve(documentReference.nativeRef)
        }).catch(error => {
            promise.reject(error)
        })

        return promise
    }

    update(dataToSave: any): ReactivePromise<boolean> {
        const promise = new ReactivePromise<boolean>()

        if (dataToSave && Object.keys(dataToSave).length === 0) {
            promise.resolve(true)
            return promise
        }

        updateDoc(this.docReference, dataToSave).then(() => {
            promise.resolve(true)
        }).catch(error => {
            promise.reject(error)
        })

        return promise
    }

    merge(dataToSave: any): ReactivePromise<boolean> {
        const promise = new ReactivePromise<boolean>()

        if (dataToSave && Object.keys(dataToSave).length === 0) {
            promise.resolve(true)
            return promise
        }

        setDoc(this.docReference, dataToSave, { merge: true }).then(() => {
            promise.resolve(true)
        }).catch(error => {
            promise.reject(error)
        })

        return promise
    }

    remove(): ReactivePromise<boolean> {
        let promise = new ReactivePromise<boolean>()
        deleteDoc(this.docReference).then(() => {
            promise.resolve(true)
        }).catch(error => {
            promise.reject(error)
        })

        return promise
    }
}

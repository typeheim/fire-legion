import { StatefulSubject } from '@typeheim/fire-rx'
// Firestore types
import * as types from '@firebase/firestore-types'
import DocumentReference = types.DocumentReference

export class DocPersistenceManager<Entity> {
    constructor(protected docReference: DocumentReference) {}

    update(dataToSave: any): StatefulSubject<boolean> {
        let subject = new StatefulSubject<boolean>(1)
        this.docReference.update(dataToSave).then(() => {
            subject.next(true)
            subject.complete()
        })

        return subject
    }

    remove(): StatefulSubject<boolean> {
        let subject = new StatefulSubject<boolean>(1)
        this.docReference.delete().then(() => {
            subject.next(true)
            subject.complete()
        })

        return subject
    }
}

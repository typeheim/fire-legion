import { DocumentReference, WriteResult } from '@google-cloud/firestore'
import { FireReplaySubject } from '@typeheim/fire-rx'

export class DocPersistenceManager<Entity> {
    constructor(protected docReference: DocumentReference) {}

    update(dataToSave: any): FireReplaySubject<WriteResult> {
        let subject = new FireReplaySubject<WriteResult>(1)
        this.docReference.update(dataToSave).then((writeResult: WriteResult) => {
            subject.next(writeResult)
            subject.complete()
        })

        return subject
    }

    remove(): FireReplaySubject<WriteResult> {
        let subject = new FireReplaySubject<WriteResult>(1)
        this.docReference.delete().then((writeResult: WriteResult) => {
            subject.next(writeResult)
            subject.complete()
        })

        return subject
    }
}

import { EntityManager } from './EntityManager'
import { StatefulSubject } from '@typeheim/fire-rx'
import { ChangedEntities } from '../Data/ChangedEntities'
import { CollectionReference } from './CollectionReference'
import {
    EntityFilter,
    EntityMetadata,
    FilterFunction,
} from '../../index'

import { FieldFilter } from './FieldFilter'
import { QueryState } from '../Contracts/Query'
// Firestore types
import * as types from '@firebase/firestore-types'
import QuerySnapshot = types.QuerySnapshot
import DocumentChange = types.DocumentChange
import DocumentSnapshot = types.DocumentSnapshot
import QueryDocumentSnapshot = types.QueryDocumentSnapshot

export class CollectionQuery<Entity> {
    protected queryState: QueryState = {
        conditions: [],
        limit: -1,
        exclude: [],
    }

    constructor(protected collectionReference: CollectionReference, protected entityManager: EntityManager<Entity>, protected metadata: EntityMetadata) {}

    exclude(id: string)
    exclude(ids: string[])
    exclude(ids: string[] | string) {
        if (typeof ids == 'string') {
            this.queryState.exclude.push(ids)
        } else {
            this.queryState.exclude = ids
        }

        return this
    }

    filter(filterFunction: FilterFunction<Entity>) {
        let filter: EntityFilter<Entity> = {}

        this.metadata.fields.forEach(field => {
            filter[field.name] = new FieldFilter(this.queryState, field.name)
        })

        filterFunction(filter)

        return this
    }

    limit(limit: number) {
        this.queryState.limit = limit

        return this
    }

    get(): StatefulSubject<Entity[]> {
        let subject = new StatefulSubject<Entity[]>(1)

        this.collectionReference.get(this.queryState).subscribe((querySnapshot: QuerySnapshot) => {
            let entities = []
            let docs
            if (this.queryState.exclude) {
                docs = querySnapshot.docs.filter(doc => !this.queryState.exclude.includes(doc.id))
            } else {
                docs = querySnapshot
            }
            docs.forEach((docSnapshot: DocumentSnapshot) => {
                entities.push(this.entityManager.fromSnapshot(docSnapshot))
            })
            subject.next(entities)
            subject.complete()
        }, error => subject.error(error))

        return subject
    }

    changes(): StatefulSubject<ChangedEntities<Entity>> {
        let subject = new StatefulSubject<ChangedEntities<Entity>>(1)

        this.collectionReference.snapshot(this.queryState).subscribe((querySnapshot: QuerySnapshot) => {
            let entityChanges = []
            querySnapshot.docChanges().forEach((docSnapshot: DocumentChange) => {
                let entity = this.entityManager.fromSnapshot(docSnapshot.doc)
                if (entity) {
                    entityChanges.push({
                        type: docSnapshot.type,
                        entity,
                    })
                }
            })
            subject.next(new ChangedEntities<Entity>(entityChanges))
        }, error => subject.error(error))

        return subject
    }

    stream(): StatefulSubject<Entity[]> {
        let subject = new StatefulSubject<Entity[]>(1)

        this.collectionReference.snapshot(this.queryState).subscribe((querySnapshot: QuerySnapshot) => {
            let entities = []

            querySnapshot.forEach((docSnapshot: QueryDocumentSnapshot) => {
                let entity = this.entityManager.fromSnapshot(docSnapshot)
                if (entity) {
                    entities.push(entity)
                }
            })
            subject.next(entities)
        }, error => subject.error(error))

        return subject
    }
}

import { EntityManager } from './EntityManager'
import { ChangedEntities } from '../Data/ChangedEntities'
import { CollectionReference } from './CollectionReference'
import {
    EntityFilter,
    EntityIndex,
    FilterFunction,
    IndexFunction,
    PropertyMetadata,
} from '../../index'

import { FieldFilter } from './FieldFilter'
import {
    QueryState,
    SortOrder,
} from '../Contracts/Query'
// Firestore types
import * as types from '@firebase/firestore-types'
import { EntityStream } from '../Data/EntityStream'
import {
    debounceTime,
    map,
} from 'rxjs/operators'
import { EntityPromise } from '../Data/EntityPromise'
import QuerySnapshot = types.QuerySnapshot
import DocumentChange = types.DocumentChange
import DocumentSnapshot = types.DocumentSnapshot
import QueryDocumentSnapshot = types.QueryDocumentSnapshot
import { IndexFilter } from './IndexFilter'

export class CollectionQuery<Entity, FetchType = Entity[]> {
    protected queryState: QueryState = {
        conditions: [],
        indexes: [],
        limit: -1,
        orderBy: [],
        exclude: [],
    }

    constructor(protected collectionReference: CollectionReference, protected entityManager: EntityManager<Entity>, protected filterFields: PropertyMetadata[]) {}

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

    map<T = Entity, R = any>(operator: ((value: Entity[]) => R)): CollectionQuery<T, R> {
        this.queryState.map = operator

        return this as any
    }

    debounceUpdates(dueTime: number) {
        this.queryState.debounceUpdatesTime = dueTime

        return this
    }

    useIndex(indexFunction: IndexFunction<Entity>) {
        let filter: EntityIndex<Entity> = {}

        this.filterFields.forEach(field => {
            filter[field.name] = new IndexFilter(this.queryState, field.name)
        })

        indexFunction(filter)

        return this
    }

    filter(filterFunction: FilterFunction<Entity>) {
        let filter: EntityFilter<Entity> = {}

        this.filterFields.forEach(field => {
            filter[field.name] = new FieldFilter(this.queryState, field.name)
        })

        filterFunction(filter)

        return this
    }

    limit(limit: number) {
        this.queryState.limit = limit

        return this
    }

    orderBy(field: string, sortOrder = SortOrder.Ascending) {
        this.queryState.orderBy.push({
            field,
            sortOrder,
        })

        return this
    }

    startAt(position: Entity | any) {
        this.queryState.startAt = position

        return this
    }

    startAfter(position: Entity | any) {
        this.queryState.startAfter = position

        return this
    }

    endAt(position: Entity | any) {
        this.queryState.endAt = position

        return this
    }

    endBefore(position: Entity | any) {
        this.queryState.endBefore = position

        return this
    }

    get(): EntityPromise<FetchType> {
        let entitiesPromise = new EntityPromise<any>()
        this.collectionReference.get(this.queryState).then((querySnapshot: QuerySnapshot) => {
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

            if (this.queryState.map) {
                entities = this.queryState.map(entities)
            }

            entitiesPromise.resolve(entities)
        }).catch(error => entitiesPromise.reject(error))

        return entitiesPromise
    }

    changes(): EntityStream<ChangedEntities<Entity>> {
        let snapshotStream = this.collectionReference.snapshot(this.queryState)
        let dataStream = this.queryState.debounceUpdatesTime ? snapshotStream.pipe(debounceTime(this.queryState.debounceUpdatesTime)) : snapshotStream

        let source = dataStream.pipe(map((querySnapshot: QuerySnapshot) => {
            let entityChanges = []
            querySnapshot.docChanges().forEach((change: DocumentChange) => {
                let entity = this.entityManager.fromSnapshot(change.doc)
                if (entity) {
                    entityChanges.push({
                        type: change.type,
                        entity,
                    })
                }
            })
            if (this.queryState.map) {
                entityChanges = this.queryState.map(entityChanges)
            }

            return new ChangedEntities<Entity>(entityChanges)
        }))

        return new EntityStream<ChangedEntities<Entity>>(source, snapshotStream)
    }

    stream(): EntityStream<FetchType> {
        let snapshotStream = this.collectionReference.snapshot(this.queryState)
        let dataStream = this.queryState.debounceUpdatesTime ? snapshotStream.pipe(debounceTime(this.queryState.debounceUpdatesTime)) : snapshotStream

        let source = dataStream.pipe(map((querySnapshot: QuerySnapshot) => {
            let entities = []

            querySnapshot.forEach((docSnapshot: QueryDocumentSnapshot) => {
                let entity = this.entityManager.fromSnapshot(docSnapshot)
                if (entity) {
                    entities.push(entity)
                }
            })
            if (this.queryState.map) {
                entities = this.queryState.map(entities)
            }
            return entities
        }))

        return new EntityStream<FetchType>(source, snapshotStream)
    }
}

import { EntityType } from '../Contracts/EntityType'
import { Factory } from './CollectionFactory'
import { Collection } from './Collection'

export class CollectionMap {
    protected storage = new Map<any, Collection<any>>()
    protected groupStorage = new Map<any, Collection<any>>()

    constructor(protected factory: Factory) {}

    of<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        if (!this.storage.has(entity)) {
            this.storage.set(entity, this.factory.createFor(entity))
        }

        return this.storage.get(entity)
    }

    groupOf<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        if (!this.groupStorage.has(entity)) {
            this.groupStorage.set(entity, this.factory.createGroupFor(entity))
        }

        return this.groupStorage.get(entity)
    }
}

import { EntityType } from '../Contracts/EntityType'
import { Factory } from './CollectionFactory'
import { Collection } from './Collection'

export class CollectionMap {
    protected storage: CollectionsStorage = {}
    protected groupStorage: CollectionsStorage = {}

    constructor(protected factory: Factory) {}

    of<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        const entityClassName = entity.prototype.constructor.name
        if (!this.storage.hasOwnProperty(entityClassName)) {
            this.storage[entityClassName] = this.factory.createFor(entity)
        }

        return this.storage[entityClassName]
    }

    groupOf<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        const entityClassName = entity.prototype.constructor.name
        if (!this.groupStorage.hasOwnProperty(entityClassName)) {
            this.groupStorage[entityClassName] = this.factory.createGroupFor(entity)
        }

        return this.groupStorage[entityClassName]
    }
}

interface CollectionsStorage {
    [key: string]: Collection<any>;
}

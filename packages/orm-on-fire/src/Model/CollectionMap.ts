import { EntityType } from '../Contracts/EntityType'
import { Factory } from './CollectionFactory'
import { Collection } from './Collection'

export class CollectionMap {
    protected storage: CollectionsStorage = {}

    constructor(protected factory: Factory) {}

    of<Entity>(entity: EntityType<Entity>): Collection<Entity> {
        const entityClassName = entity.prototype.constructor.name
        if (!this.storage.hasOwnProperty(entityClassName)) {
            this.storage[entityClassName] = this.factory.createFor(entity)
        }

        return this.storage[entityClassName]
    }
}

interface CollectionsStorage {
    [key: string]: Collection<any>;
}

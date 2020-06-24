import { EntityType } from '../Contracts/EntityType'
import { CollectionFactory } from '../singletons'
import { FirestoreConnection } from '../Persistence/FirestoreConnection'
import { GenericCollection } from '@typeheim/orm-on-fire'
import { Factory } from './CollectionFactory'

export class CollectionMap {
    protected storage: CollectionsStorage = {}

    constructor(protected factory: Factory) {}

    of<Entity>(entity: EntityType<Entity>): GenericCollection<Entity> {
        const entityClassName = entity.prototype.constructor.name
        if (!this.storage.hasOwnProperty(entityClassName)) {
            this.storage[entityClassName] = this.factory.createFor(entity)
        }

        return this.storage[entityClassName]
    }
}

interface CollectionsStorage {
    [key: string]: GenericCollection<any>;
}

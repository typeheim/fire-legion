import { ChangeType } from '../Contracts/Types'

export class ChangedEntities<Entity> {
    constructor(protected entityChanges: EntityChange<Entity>[]) {}

    forEach(callback: ((entity: Entity, changeType: ChangeType) => void)) {
        this.entityChanges.forEach((entityChange: EntityChange<Entity>) => {
            callback(entityChange.entity, entityChange.type)
        })
    }

    toArray() {
        return this.entityChanges.map((change: EntityChange<Entity>) => change.entity)
    }

    get length() {
        return this.entityChanges.length
    }
}

interface EntityChange<Entity> {
    type: ChangeType
    entity: Entity
}


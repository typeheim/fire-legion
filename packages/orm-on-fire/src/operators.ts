import { Model } from './Contracts/Model'
import { InternalCollectionsMap } from './singletons'

export function save(model: Model | any) {
    return InternalCollectionsMap.of(model.constructor).save(model)
}

export function remove(model: Model | any) {
    return InternalCollectionsMap.of(model.constructor).remove(model)
}

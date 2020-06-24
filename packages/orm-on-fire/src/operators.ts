import { Model } from './Contracts/Model'
import { Collection } from './singletons'

export function save(model: Model | any) {
    return Collection.of(model.constructor).save(model)
}

export function remove(model: Model | any) {
    return Collection.of(model.constructor).remove(model)
}

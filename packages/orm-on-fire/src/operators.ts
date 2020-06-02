import { Model } from './Contracts/Model'
import { Repo } from './singletons'

export function save(model: Model | any) {
    return Repo.of(model.constructor).save(model)
}

export function remove(model: Model | any) {
    return Repo.of(model.constructor).remove(model)
}

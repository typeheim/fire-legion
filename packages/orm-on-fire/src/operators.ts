import { Model } from './Contracts/Model'

export function save(model: Model) {
    return model.__ormOnFire.repository.save(model)
}

export function remove(model: Model) {
    return model.__ormOnFire.repository.remove(model)
}

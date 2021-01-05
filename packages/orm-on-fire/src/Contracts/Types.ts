import { FireFilter } from './Query'
import { IndexFilter } from '../Persistence/IndexFilter'

export enum ChangeType {
    Added = 'added',
    Modified = 'modified',
    Removed = 'removed'
}

export type EntityFilter<Entity> = {
    [Key in keyof Entity]?: FireFilter<Entity>
}

export type EntityIndex<Entity> = {
    [Key in keyof Entity]?: IndexFilter<Entity>
}

export type FilterFunction<Entity> = (filter: EntityFilter<Entity>) => void

export type IndexFunction<Entity> = (filter: EntityIndex<Entity>) => void

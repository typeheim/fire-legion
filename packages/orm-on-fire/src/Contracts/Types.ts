import { FireFilter } from './Query'

export enum ChangeType {
    Added = 'added',
    Modified = 'modified',
    Removed = 'removed'
}

export type EntityFilter<Entity> = {
    [Key in keyof Entity]?: FireFilter<Entity>
}

export type FilterFunction<Entity> = (filter: EntityFilter<Entity>) => void

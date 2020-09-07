// Firestore types
import * as types from '@firebase/firestore-types'
import WhereFilterOp = types.WhereFilterOp
import { MonoTypeOperatorFunction } from 'rxjs/src/internal/types'
import { SchedulerLike } from 'rxjs'

export interface FireFilter<Entity> {
    equal(value: any): FireFilter<Entity>

    greaterThen(value: any): FireFilter<Entity>

    lessThen(value: any): FireFilter<Entity>

    greaterThenOrEqual(value: any): FireFilter<Entity>

    lessThenOrEqual(value: any): FireFilter<Entity>

    in(list: any): FireFilter<Entity>

    contain(value: any): FireFilter<Entity>

    containAnyOf(list: any): FireFilter<Entity>

    startsWith(glue: string): FireFilter<Entity>

    endsWith(glue: string): FireFilter<Entity>

    field(fieldName: string): FireFilter<Entity>
}

export interface FieldCondition {
    fieldName: string
    operator: WhereFilterOp
    compareValue: any
}

export enum SortOrder {
    Ascending = 0,
    Descending = 1
}

export interface QueryState {
    conditions?: FieldCondition[]
    limit?: number
    orderBy?: OrderByCondition[]
    startAt?: any
    startAfter?: any
    endAt?: any
    endBefore?: any
    exclude?: string[]
    map?: MapOperator<any>
    debounceUpdatesTime?: number
}

export type MapOperator<T> = (value: T[]) => any

interface OrderByCondition {
    field: string
    sortOrder?: SortOrder
}

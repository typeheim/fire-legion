// Firestore types
import * as types from '@firebase/firestore-types'
import WhereFilterOp = types.WhereFilterOp

export interface FireFilter<Entity> {
    equal(value: any): FireFilter<Entity>

    greaterThen(value: any): FireFilter<Entity>

    lessThen(value: any): FireFilter<Entity>

    greaterThenOrEqual(value: any): FireFilter<Entity>

    lessThenOrEqual(value: any): FireFilter<Entity>

    in(list: any): FireFilter<Entity>

    contain(value: any): FireFilter<Entity>

    containAnyOf(list: any): FireFilter<Entity>

    match(clue: string): FireFilter<Entity>

    startsWith(glue: string): FireFilter<Entity>

    endsWith(glue: string): FireFilter<Entity>
}

export interface FieldCondition {
    fieldName: string
    operator: WhereFilterOp
    compareValue: any
}

export interface QueryState {
    conditions?: FieldCondition[]
    limit?: number
    exclude?: string[]
}

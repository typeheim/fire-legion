import * as firebase from 'firebase'
import WhereFilterOp = firebase.firestore.WhereFilterOp

export interface FireFilter<Entity> {
    equal(value: any): FireFilter<Entity>

    graterThen(value: any): FireFilter<Entity>

    loverThen(value: any): FireFilter<Entity>

    graterThenOrEqual(value: any): FireFilter<Entity>

    loverThenOrEqual(value: any): FireFilter<Entity>

    in(list: any): FireFilter<Entity>

    contain(value: any): FireFilter<Entity>

    containAnyOf(list: any): FireFilter<Entity>
}

export interface FieldCondition {
    fieldName: string
    operator: WhereFilterOp
    compareValue: any
}

export interface QueryState {
    conditions?: FieldCondition[]
    limit?: number
}

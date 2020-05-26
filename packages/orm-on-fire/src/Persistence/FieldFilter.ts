import { FieldCondition, FireFilter, QueryState } from '../Contracts/Query'

export class FieldFilter<Entity> implements FireFilter<Entity> {
    constructor(protected queryState: QueryState, protected readonly fieldName) {}

    equal(value: any): FieldFilter<Entity> {
        this.addCondition('==', value)

        return this
    }

    graterThen(value: any): FieldFilter<Entity> {
        this.addCondition('>', value)

        return this
    }

    loverThen(value: any): FieldFilter<Entity> {
        this.addCondition('<', value)

        return this
    }

    graterThenOrEqual(value: any): FieldFilter<Entity> {
        this.addCondition('>=', value)

        return this
    }

    loverThenOrEqual(value: any): FieldFilter<Entity> {
        this.addCondition('<=', value)

        return this
    }

    in(list: any): FieldFilter<Entity> {
        this.addCondition('in', list)

        return this
    }

    contain(value: any): FieldFilter<Entity> {
        this.addCondition('array-contains', value)

        return this
    }

    containAnyOf(list: any): FieldFilter<Entity> {
        this.addCondition('array-contains-any', list)

        return this
    }

    protected addCondition(operator: string, value: any) {
        this.queryState.conditions.push({
            fieldName: this.fieldName,
            operator: operator,
            compareValue: value
        } as FieldCondition)
    }
}

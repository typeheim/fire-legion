import {
    FieldCondition,
    FireFilter,
    QueryState,
} from '../Contracts/Query'

export class FieldFilter<Entity> implements FireFilter<Entity> {
    protected textIndexName: string
    protected textReverseIndexName: string

    constructor(protected queryState: QueryState, protected readonly fieldName) {
        this.textIndexName = `__idx__text__${fieldName}`
        this.textReverseIndexName = `__idx__text__reverse__${fieldName}`
    }

    equal(value: any): FieldFilter<Entity> {
        this.addCondition('==', value)

        return this
    }

    greaterThen(value: any): FieldFilter<Entity> {
        this.addCondition('>', value)

        return this
    }

    lessThen(value: any): FieldFilter<Entity> {
        this.addCondition('<', value)

        return this
    }

    greaterThenOrEqual(value: any): FieldFilter<Entity> {
        this.addCondition('>=', value)

        return this
    }

    lessThenOrEqual(value: any): FieldFilter<Entity> {
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

    startsWith(clue: string): FieldFilter<Entity> {
        this.addCondition('array-contains', clue.toLowerCase(), this.textIndexName)

        return this
    }

    endsWith(clue: string): FieldFilter<Entity> {
        this.addCondition('array-contains', this.reverseSearchTerm(clue.toLowerCase()), this.textReverseIndexName)

        return this
    }

    field(fieldName: string): FieldFilter<Entity> {
        return new FieldFilter(this.queryState, `${this.fieldName}.${fieldName}`)
    }

    protected reverseSearchTerm(text: string) {
        return text.split('').reverse().join('')
    }

    protected addCondition(operator: string, value: any, indexName?: string) {
        this.queryState.conditions.push({
            fieldName: indexName ?? this.fieldName,
            operator: operator,
            compareValue: value,
        } as FieldCondition)
    }
}

import {
    FieldCondition,
    FireFilter,
    QueryState,
} from '../Contracts/Query'

export class IndexFilter<Entity> {
    protected textIndexName: string
    protected textReverseIndexName: string

    constructor(protected queryState: QueryState, protected readonly fieldName) {
        this.textIndexName = `idx__txt__${fieldName}`
        this.textReverseIndexName = `idx__rtxt__${fieldName}`
    }

    startsWith(clue: string): IndexFilter<Entity> {
        this.addCondition('array-contains', clue.toLowerCase(), this.textIndexName)

        return this
    }

    endsWith(clue: string): IndexFilter<Entity> {
        this.addCondition('array-contains', this.reverseSearchTerm(clue.toLowerCase()), this.textReverseIndexName)

        return this
    }

    protected reverseSearchTerm(text: string) {
        return text.split('').reverse().join('')
    }

    protected addCondition(operator: string, value: any, indexName?: string) {
        this.queryState.indexes.push({
            fieldName: indexName ?? this.fieldName,
            operator: operator,
            compareValue: value,
        } as FieldCondition)
    }
}

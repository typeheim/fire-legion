export interface SpecScope {
    fixtures?
}

export type ScopeAction = (scope: SpecScope, done?) => void

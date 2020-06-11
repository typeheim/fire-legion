import { FirestoreConnection, OrmOnFire } from '@typeheim/orm-on-fire'

class Legion {
    constructor(protected frameworkContext: FrameworkContext) {}

    get ormOnFire() {
        return this.frameworkContext.ormOnFire
    }
}

interface FrameworkContext {
    ormOnFire: FirestoreConnection
}

export const FireLegion = new Legion({
    ormOnFire: OrmOnFire
})

import { EntityManager } from '../Persistence/EntityManager'
import { Model } from '../Contracts/Model'
import { ReactivePromise } from '@typeheim/fire-rx'

export class EntityStore<Entity extends Model> {
    constructor(protected entityManager: EntityManager<Entity>) {}

    public new(id?: string): ReactivePromise<Entity> {
        let entity = this.entityManager.createEntity()
        if (entity) {
            entity.id = id
        }
        let promise = new ReactivePromise<Entity>()

        this.save(entity).then(result => {
            promise.resolve(entity)
        })

        return promise
    }

    // @ts-ignore
    public async save(entity: Entity): ReactivePromise<boolean> {
        // type safety check to ensure dock path will be a string
        if (entity['id'] && typeof entity['id'] !== 'string') {
            entity['id'] = '' + entity['id']
        }

        const data = this.extractDataFromEntity(entity)
        const metadata = this.entityManager.getOrmMetadata(entity)
        let saveResult = true
        if (metadata.isNew) {
            const docRef = await metadata.persister.add(data, entity['id'])
            entity['id'] = docRef.id
            this.entityManager.refreshNewEntity(entity, docRef)
        } else {
            saveResult = await metadata.persister.update(data)
            if (saveResult) {
                metadata.mutationTracker.refreshEntity()
            }
        }

        return saveResult
    }

    // @ts-ignore
    public async merge(entity: Entity): ReactivePromise<boolean> {
        this.ensureIdIsString(entity)

        const data = this.extractDataFromEntity(entity)
        const metadata = this.entityManager.getOrmMetadata(entity)
        let saveResult = true
        if (metadata.isNew) {
            throw Error('New entities can\'t be merged!')
        }

        if (await metadata.persister.merge(data)) {
            metadata.mutationTracker.refreshEntity()
        }

        return saveResult
    }

    protected ensureIdIsString(entity: Entity) {
        // type safety check to ensure dock path will be a string
        if (entity['id'] && typeof entity['id'] !== 'string') {
            entity['id'] = '' + entity['id']
        }
    }

    public remove(entity: Entity): ReactivePromise<boolean> {
        const metadata = this.entityManager.getOrmMetadata(entity)
        if (!metadata || metadata.isNew) {
            throw Error('Entity must be saved prior removing!')
        }

        return metadata.persister.remove()
    }

    public extractDataFromEntity(entity: Model) {
        const fields = this.entityManager.getEntityFields()
        let dataToSave = {}
        let changes = null
        if (!(entity?.__ormOnFire?.isNew || entity.__ormOnFire === undefined)) {
            // not new entities require mutation check
            changes = entity?.__ormOnFire?.mutation?.getChanges(entity)
        }

        fields.forEach(field => {
            if (field?.isDate && field?.updateOnSave) {
                let date = new Date()
                entity[field.name] = date
                dataToSave[field.name] = date
            } else if (field?.isDate && field?.generateOnCreate && (entity?.__ormOnFire?.isNew || entity.__ormOnFire === undefined)) {
                let date = new Date()
                entity[field.name] = date
                dataToSave[field.name] = date
            }
            if (changes && field.name in changes) {
                dataToSave[field.name] = changes[field.name]
            } else if ((entity?.__ormOnFire?.isNew || entity.__ormOnFire === undefined) && entity[field.name] !== undefined) {
                // this condition required only for new entities
                if (field?.isMap && Array.isArray(entity[field.name])) {
                    dataToSave[field.name] = entity[field.name].map(obj => {
                        return { ...obj }
                    })
                } else if (field?.isMap) {
                    dataToSave[field.name] = { ...entity[field.name] }
                } else {
                    dataToSave[field.name] = entity[field.name]
                }

            }
        })
        const docRefs = this.entityManager.getEntityDocRefs()

        for (let fieldName in docRefs) {
            let docRef = entity[fieldName]?.___docReference
            if (docRef) {
                dataToSave[fieldName] = docRef.nativeRef
            }
        }

        return dataToSave
    }
}

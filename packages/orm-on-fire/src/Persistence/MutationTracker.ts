// @todo - change mutation tracker to use snapshot as source of original data
import { PropertyMetadata } from '@typeheim/orm-on-fire'

export class MutationTracker {
    protected copy = {}
    protected fields: PropertyMetadata[]
    protected entity

    constructor(entity, fields: PropertyMetadata[]) {
        this.fields = fields
        this.entity = entity

        this.refreshEntity()
    }

    public refreshEntity() {
        let entity = this.entity
        let fields = this.fields
        this.copy = {}

        fields.forEach(field => {
            if (entity[field.name] === undefined) {
                return
            }

            if (Array.isArray(entity[field.name])) {
                // this.copy[field.name] = entity[field.name]?.slice()
                this.copy[field.name] = this.deepCopy(entity[field.name])
            } else if (field.isMap) {
                this.copy[field.name] = { ...entity[field.name] }
            } else if (typeof entity[field.name] === 'object' && entity[field.name] instanceof Date) {
                this.copy[field.name] = new Date(entity[field.name].getTime())
            } else if (typeof entity[field.name] === 'object') {
                this.copy[field.name] = { ...entity[field.name] }
            } else {
                this.copy[field.name] = entity[field.name]
            }
        })
    }

    getChanges(entity) {
        let changes = {}
        this.fields.forEach(field => {
            // @todo - half of checks disabled because of instability. Need further tetsing
            if (entity[field.name] === undefined) {
                if (this.copy[field.name] !== undefined) {
                    // changes[field.name] = FieldValue.delete() - somehow fails TS
                    changes[field.name] = undefined
                } else {
                    return
                }
            } else if (Array.isArray(entity[field.name])) { // array should be checked explicitly
                changes[field.name] = entity[field.name]
                // if (JSON.stringify(entity[field.name]) !== JSON.stringify(this.copy[field.name])) {
                //     changes[field.name] = entity[field.name]
                // }
            } else if (typeof entity[field.name] === 'object' && entity[field.name] !== null) {
                // dates must be compared by time
                // if (entity[field.name] instanceof Date && entity[field.name]?.getTime() !== this.copy[field.name]?.getTime()) {
                //     changes[field.name] = entity[field.name]
                // } else if (JSON.stringify(entity[field.name]) !== JSON.stringify(this.copy[field.name])) {
                //     // objects need deep equality compare
                //     changes[field.name] = { ...entity[field.name] }
                // }
                //dates must be compared by time
                if (entity[field.name] instanceof Date) {
                    if (this.copy[field.name] && entity[field.name]?.getTime() !== this.copy[field.name]?.getTime()) {
                        changes[field.name] = entity[field.name]
                    } else if (!this.copy[field.name]) {
                        changes[field.name] = entity[field.name]
                    }

                } else {
                    // objects need deep equality compare
                    changes[field.name] = { ...entity[field.name] }
                }
            } else if (entity[field.name] !== this.copy[field.name]) {
                changes[field.name] = entity[field.name]
            }
        })

        return changes
    }

    protected deepCopy(inObject) {
        let outObject, value, key

        if (typeof inObject !== 'object' || inObject === null) {
            return inObject // Return the value if inObject is not an object
        }

        // Create an array or object to hold the values
        outObject = Array.isArray(inObject) ? [] : {}

        for (key in inObject) {
            value = inObject[key]

            // Recursively (deep) copy for nested objects, including arrays
            outObject[key] = this.deepCopy(value)
        }

        return outObject
    }
}

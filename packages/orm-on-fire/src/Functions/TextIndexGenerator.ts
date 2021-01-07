import { TextTriggerConfig } from './Contracts'

export class TextIndexGenerator {
    buildMetadata(config: TextTriggerConfig, change: Change<DocumentSnapshot>) {
        if (!change.after.exists) {
            return null
        }
        const document = change.after.data()
        const oldDocument = change.before.data()

        let indexFields = []
        if (config.recalculateOnSave) {
            indexFields = config.fields
        } else {
            config.fields.forEach(fieldName => {
                if (!change.before.exists) {
                    indexFields.push(fieldName)
                } else if (document[fieldName] !== oldDocument[fieldName]) {
                    indexFields.push(fieldName)
                }
            })
        }

        if (indexFields.length < 1) {
            return null
        }

        return this.generateIndex(document, indexFields)
    }

    generateIndex(data, fields: string[]) {
        let metadata = {}
        fields.forEach(fieldName => {
            if (data[fieldName] !== undefined) {
                metadata[`idx__txt__${fieldName}`] = this.createTextIndex(data[fieldName])
                metadata[`idx__rtxt__${fieldName}`] = this.createReverseTextIndex(data[fieldName])
            } else {
                metadata[`idx__txt__${fieldName}`] = []
                metadata[`idx__rtxt__${fieldName}`] = []
            }
        })

        return metadata

    }

    protected createTextIndex(text: string): string[] {
        const arrName = []
        let curName = ''
        text.split('').forEach(letter => {
            curName += letter.toLowerCase()
            arrName.push(curName)
        })
        return arrName
    }

    protected createReverseTextIndex(text: string): string[] {
        const arrName = []
        let curName = ''
        text.split('').reverse().forEach(letter => {
            curName += letter.toLowerCase()
            arrName.push(curName)
        })
        return arrName
    }
}

//
// Internal interfaces to define firestore types
//

interface Change<T> {
    before: T;
    after: T;
}

interface DocumentSnapshot<T = any> {
    /** True if the document exists. */
    readonly exists: boolean;

    /**
     * The ID of the document for which this `DocumentSnapshot` contains data.
     */
    readonly id: string;

    /**
     * Retrieves all fields in the document as an Object. Returns 'undefined' if
     * the document doesn't exist.
     *
     * @return An Object containing all fields in the document.
     */
    data(): T | undefined;
}

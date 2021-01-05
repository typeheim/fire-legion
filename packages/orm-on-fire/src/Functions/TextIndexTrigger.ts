import { TextTriggerConfig } from './Contracts'
import { TextIndexGenerator } from './TextIndexGenerator'

const Generator = new TextIndexGenerator()

export function TextIndex(functionsProvider) {
    let config = {
        collection: '',
        recalculateOnSave: false,
        fields: [],
    }

    let builder = {
        forCollection: (collection: string) => {
            config.collection = `${collection}/{id}`

            return builder
        },

        recalculateOnSave: () => {
            config.recalculateOnSave = true

            return builder
        },

        fields: (fields: string[]) => {
            config.fields = fields

            return builder
        },

        buildTrigger() {
            return functionsProvider.firestore
                                    .document(config.collection)
                                    .onWrite(BuildTrigger(config, functionsProvider.firestore))
        },
    }

    return builder
}

function BuildTrigger(config: TextTriggerConfig, firestore) {
    return (change) => {
        let metadata = Generator.buildMetadata(config, change)

        if (metadata) {
            return firestore.collection(`of-metadata/${config.collection}/indexes`).set(metadata, { merge: true })
        } else {
            return null
        }
    }
}

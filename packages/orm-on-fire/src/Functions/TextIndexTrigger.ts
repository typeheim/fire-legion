import { TextTriggerConfig } from './Contracts'
import { TextIndexGenerator } from './TextIndexGenerator'

const Generator = new TextIndexGenerator()

export function TextIndex(functionsProvider, firebaseAdmin) {
    let config = {
        collection: '',
        indexCollectionAlias: '',
        documentPath: '',
        recalculateOnSave: false,
        fields: [],
    }

    let builder = {
        forCollection: (collection: string) => {
            config.collection = collection
            config.indexCollectionAlias = collection
            config.documentPath = `${collection}/{id}`

            return builder
        },

        indexCollectionAlias: (collection: string) => {
            config.indexCollectionAlias = collection

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
                                    .document(config.documentPath)
                                    .onWrite(BuildTrigger(config, firebaseAdmin.firestore()))
        },
    }

    return builder
}

function BuildTrigger(config: TextTriggerConfig, firestore) {
    return (change) => {
        if (change?.after?.exists) {
            let metadata = Generator.buildMetadata(config, change)
            console.log(`Writing index to "of-metadata/${config.indexCollectionAlias}/indexes/${change.after.id}"`)

            return metadata ? firestore.collection(`of-metadata/${config.indexCollectionAlias}/indexes`).doc(change.after.id).set(metadata, { merge: true }) : null
        } else if (!change?.after?.exists) {
            console.log(`Removing index at "of-metadata/${config.indexCollectionAlias}/indexes/${change.after.id}"`)

            return firestore.collection(`of-metadata/${config.indexCollectionAlias}/indexes`).doc(change.after.id).delete()
        } else {
            return null
        }
    }
}

import { TextIndex } from '@typeheim/orm-on-fire'
import * as functions from 'firebase-functions'
import * as FirebaseAdmin from 'firebase-admin'

FirebaseAdmin.initializeApp()

export const generateUserIndex = TextIndex(functions, FirebaseAdmin).forCollection('users')
                                                                    .fields(['name', 'text'])
    // .filter((entity) => true) @todo
    // .dropIf((entity) => true) @todo
                                                                    .buildTrigger()


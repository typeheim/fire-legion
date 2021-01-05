import { TextIndex } from '@typeheim/orm-on-fire'
import * as functions from 'firebase-functions'

export const generateUserIndex = TextIndex(functions).forCollection('users')
                                                     .fields(['name', 'text'])
                                                     // .filter((entity) => true)
                                                     // .dropIf((entity) => true)
                                                     .buildTrigger()


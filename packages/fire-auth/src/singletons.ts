import * as firebase from 'firebase/app'

// Add the Firebase services that you want to use
import 'firebase/auth'
import 'firebase/firestore'

import { AuthManager } from './AuthManager'
import { AuthSession } from './AuthSession'

export const FireAuth = new AuthManager(firebase.auth())
export const FireAuthSession = new AuthSession(firebase.auth())

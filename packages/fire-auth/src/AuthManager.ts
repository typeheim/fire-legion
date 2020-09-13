import * as firebase from 'firebase/app'
import { ReactivePromise } from '@typeheim/fire-rx'

export class AuthManager {
    constructor(protected firebaseAuth: firebase.auth.Auth, usePersistence = true) {
        if (usePersistence) {
            this.enablePersistence()
        }
    }

    useDeviceLanguage(): void {
        return this.firebaseAuth.useDeviceLanguage()
    }

    signIn(authMethod: AuthMethod): ReactivePromise<firebase.auth.UserCredential> {
        return authMethod.run(this.firebaseAuth)
    }

    throughProvider(provider) {
        return {
            signInWithPopup: (): ReactivePromise<firebase.auth.UserCredential> => {
                let promise = new ReactivePromise<firebase.auth.UserCredential>()
                this.firebaseAuth.signInWithPopup(provider)
                    .then(credential => promise.resolve(credential))
                    .catch(error => promise.reject(error))

                return promise
            },

            signInWithRedirect: (): ReactivePromise<void> => {
                let promise = new ReactivePromise<void>()
                this.firebaseAuth.signInWithRedirect(provider)
                    .then(() => promise.resolve())
                    .catch(error => promise.reject(error))

                return promise
            },
        }
    }

    signInWithPhoneNumber(phoneNumber: string, applicationVerifier: firebase.auth.ApplicationVerifier): ReactivePromise<firebase.auth.ConfirmationResult> {
        let promise = new ReactivePromise<firebase.auth.ConfirmationResult>()
        this.firebaseAuth.signInWithPhoneNumber(phoneNumber, applicationVerifier)
            .then((confirmResult) => promise.resolve(confirmResult))
            .catch(error => promise.reject(error))

        return promise
    }

    getRedirectResult(): ReactivePromise<firebase.auth.UserCredential> {
        let promise = new ReactivePromise<firebase.auth.UserCredential>()
        this.firebaseAuth.getRedirectResult()
            .then(credential => promise.resolve(credential))
            .catch(error => promise.reject(error))

        return promise
    }

    signOut(): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.firebaseAuth.signOut()
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    enablePersistence(): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    disablePersistence(): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.NONE)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    async enableSessionPersistence(): Promise<void> {
        let promise = new ReactivePromise<void>()
        this.firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    createUserWithEmailAndPassword(email: string, password: string): ReactivePromise<firebase.auth.UserCredential> {
        let promise = new ReactivePromise<firebase.auth.UserCredential>()
        this.firebaseAuth.createUserWithEmailAndPassword(email, password)
            .then((credential) => promise.resolve(credential))
            .catch(error => promise.reject(error))

        return promise
    }

    sendPasswordResetEmail(email: string, actionCodeSettings?: firebase.auth.ActionCodeSettings): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.firebaseAuth.sendPasswordResetEmail(email, actionCodeSettings)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    verifyPasswordResetCode(code: string): ReactivePromise<string> {
        let promise = new ReactivePromise<string>()
        this.firebaseAuth.verifyPasswordResetCode(code)
            .then((email) => promise.resolve(email))
            .catch(error => promise.reject(error))

        return promise
    }

    sendSignInLinkToEmail(email: string, actionCodeSettings?: firebase.auth.ActionCodeSettings): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.firebaseAuth.sendSignInLinkToEmail(email, actionCodeSettings)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    isSignInWithEmailLink(emailLink: string): boolean {
        return this.firebaseAuth.isSignInWithEmailLink(emailLink)
    }

    fetchSignInMethodsForEmail(email: string): ReactivePromise<string[]> {
        let promise = new ReactivePromise<string[]>()
        this.firebaseAuth.fetchSignInMethodsForEmail(email)
            .then((methods) => promise.resolve(methods))
            .catch(error => promise.reject(error))

        return promise
    }

    confirmPasswordReset(verificationCode: string, newPassword: string): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.firebaseAuth.confirmPasswordReset(verificationCode, newPassword)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    applyActionCode(code: string): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.firebaseAuth.applyActionCode(code)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    checkActionCode(code: string): ReactivePromise<firebase.auth.ActionCodeInfo> {
        let promise = new ReactivePromise<firebase.auth.ActionCodeInfo>()
        this.firebaseAuth.checkActionCode(code)
            .then((codeInfo) => promise.resolve(codeInfo))
            .catch(error => promise.reject(error))

        return promise
    }
}

export class AuthMethod {
    protected arguments = []
    protected authMethod = ''

    run(firebaseAuth: firebase.auth.Auth): ReactivePromise<firebase.auth.UserCredential> {
        let promise = new ReactivePromise<firebase.auth.UserCredential>()
        firebaseAuth[this.authMethod](...this.arguments)
            .then(credential => promise.resolve(credential))
            .catch(error => promise.reject(error))

        return promise
    }
}

export class PasswordAuth extends AuthMethod {
    constructor(email, password) {
        super()
        this.authMethod = 'signInWithEmailAndPassword'
        this.arguments = [
            email,
            password,
        ]
    }
}

export class AnonymousAuth extends AuthMethod {
    constructor(email, password) {
        super()
        this.authMethod = 'signInAnonymously'
    }
}

export class CredentialAuth extends AuthMethod {
    constructor(credential: firebase.auth.AuthCredential) {
        super()
        this.authMethod = 'signInWithCredential'
        this.arguments = [
            credential,
        ]
    }
}

export class TokenAuth extends AuthMethod {
    constructor(token: string) {
        super()
        this.authMethod = 'signInWithCustomToken'
        this.arguments = [
            token,
        ]
    }
}

export class EmailLinkAuth extends AuthMethod {
    constructor(email: string, emailLink?: string) {
        super()
        this.authMethod = 'signInWithEmailLink'
        this.arguments = [
            email,
            emailLink,
        ]
    }
}

// base impl
// export class AuthManager {
//     constructor(protected firebaseAuth: firebase.auth.Auth, usePersistence = true) {
//         if (usePersistence) {
//             this.enablePersistence()
//         }
//     }
//
//     signInWithPopup(provider): ReactivePromise<firebase.auth.UserCredential> {
//         let promise = new ReactivePromise<firebase.auth.UserCredential>()
//         this.firebaseAuth.signInWithPopup(provider)
//             .then(credential => promise.resolve(credential))
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     signInWithEmailAndPassword(email, password): ReactivePromise<firebase.auth.UserCredential> {
//         let promise = new ReactivePromise<firebase.auth.UserCredential>()
//         this.firebaseAuth.signInWithEmailAndPassword(email, password)
//             .then(credential => promise.resolve(credential))
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     signInWithRedirect(provider): ReactivePromise<void> {
//         let promise = new ReactivePromise<void>()
//         this.firebaseAuth.signInWithRedirect(provider)
//             .then(() => promise.resolve())
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     signInAnonymously(): ReactivePromise<firebase.auth.UserCredential> {
//         let promise = new ReactivePromise<firebase.auth.UserCredential>()
//         this.firebaseAuth.signInAnonymously()
//             .then((credential) => promise.resolve(credential))
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     signInWithCredential(credential: firebase.auth.AuthCredential): ReactivePromise<firebase.auth.UserCredential> {
//         let promise = new ReactivePromise<firebase.auth.UserCredential>()
//         this.firebaseAuth.signInWithCredential(credential)
//             .then((credential) => promise.resolve(credential))
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     signInWithCustomToken(token: string): ReactivePromise<firebase.auth.UserCredential> {
//         let promise = new ReactivePromise<firebase.auth.UserCredential>()
//         this.firebaseAuth.signInWithCustomToken(token)
//             .then((credential) => promise.resolve(credential))
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     signInWithEmailLink( email: string, emailLink?: string): ReactivePromise<firebase.auth.UserCredential> {
//         let promise = new ReactivePromise<firebase.auth.UserCredential>()
//         this.firebaseAuth.signInWithEmailLink(email, emailLink)
//             .then((credential) => promise.resolve(credential))
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     signInWithPhoneNumber( phoneNumber: string, applicationVerifier: firebase.auth.ApplicationVerifier): ReactivePromise<firebase.auth.ConfirmationResult> {
//         let promise = new ReactivePromise<firebase.auth.ConfirmationResult>()
//         this.firebaseAuth.signInWithPhoneNumber(phoneNumber, applicationVerifier)
//             .then((confirmResult) => promise.resolve(confirmResult))
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     getRedirectResult(): ReactivePromise<firebase.auth.UserCredential> {
//         let promise = new ReactivePromise<firebase.auth.UserCredential>()
//         this.firebaseAuth.getRedirectResult()
//             .then(credential => promise.resolve(credential))
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     signOut(): ReactivePromise<void> {
//         let promise = new ReactivePromise<void>()
//         this.firebaseAuth.signOut()
//             .then(() => promise.resolve())
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     enablePersistence(): ReactivePromise<void> {
//         let promise = new ReactivePromise<void>()
//         this.firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
//             .then(() => promise.resolve())
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     disablePersistence(): ReactivePromise<void> {
//         let promise = new ReactivePromise<void>()
//         this.firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.NONE)
//             .then(() => promise.resolve())
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
//
//     async enableSessionPersistence(): Promise<void> {
//         let promise = new ReactivePromise<void>()
//         this.firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
//             .then(() => promise.resolve())
//             .catch(error => promise.reject(error))
//
//         return promise
//     }
// }


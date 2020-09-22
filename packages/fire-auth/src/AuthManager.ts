import * as firebase from 'firebase/app'
import 'firebase/auth'

import { ReactivePromise } from '@typeheim/fire-rx'

export class AuthManager {
    protected authDriver: firebase.auth.Auth

    setAuthDriver(driver: firebase.auth.Auth, usePersistence = true) {
        this.authDriver = driver
        if (usePersistence) {
            this.enablePersistence()
        }
    }

    useDeviceLanguage(): void {
        return this.authDriver.useDeviceLanguage()
    }

    signIn(authMethod: AuthMethod): ReactivePromise<firebase.auth.UserCredential> {
        return authMethod.run(this.authDriver)
    }

    throughProvider(provider) {
        return {
            signInWithPopup: (): ReactivePromise<firebase.auth.UserCredential> => {
                let promise = new ReactivePromise<firebase.auth.UserCredential>()
                this.authDriver.signInWithPopup(provider)
                    .then(credential => promise.resolve(credential))
                    .catch(error => promise.reject(error))

                return promise
            },

            signInWithRedirect: (): ReactivePromise<void> => {
                let promise = new ReactivePromise<void>()
                this.authDriver.signInWithRedirect(provider)
                    .then(() => promise.resolve())
                    .catch(error => promise.reject(error))

                return promise
            },
        }
    }

    signInWithPhoneNumber(phoneNumber: string, applicationVerifier: firebase.auth.ApplicationVerifier): ReactivePromise<firebase.auth.ConfirmationResult> {
        let promise = new ReactivePromise<firebase.auth.ConfirmationResult>()
        this.authDriver.signInWithPhoneNumber(phoneNumber, applicationVerifier)
            .then((confirmResult) => promise.resolve(confirmResult))
            .catch(error => promise.reject(error))

        return promise
    }

    getRedirectResult(): ReactivePromise<firebase.auth.UserCredential> {
        let promise = new ReactivePromise<firebase.auth.UserCredential>()
        this.authDriver.getRedirectResult()
            .then(credential => promise.resolve(credential))
            .catch(error => promise.reject(error))

        return promise
    }

    signOut(): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.authDriver.signOut()
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    enablePersistence(): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.authDriver.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    disablePersistence(): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.authDriver.setPersistence(firebase.auth.Auth.Persistence.NONE)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    async enableSessionPersistence(): Promise<void> {
        let promise = new ReactivePromise<void>()
        this.authDriver.setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    createUserWithEmailAndPassword(email: string, password: string): ReactivePromise<firebase.auth.UserCredential> {
        let promise = new ReactivePromise<firebase.auth.UserCredential>()
        this.authDriver.createUserWithEmailAndPassword(email, password)
            .then((credential) => promise.resolve(credential))
            .catch(error => promise.reject(error))

        return promise
    }

    sendPasswordResetEmail(email: string, actionCodeSettings?: firebase.auth.ActionCodeSettings): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.authDriver.sendPasswordResetEmail(email, actionCodeSettings)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    verifyPasswordResetCode(code: string): ReactivePromise<string> {
        let promise = new ReactivePromise<string>()
        this.authDriver.verifyPasswordResetCode(code)
            .then((email) => promise.resolve(email))
            .catch(error => promise.reject(error))

        return promise
    }

    sendSignInLinkToEmail(email: string, actionCodeSettings?: firebase.auth.ActionCodeSettings): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.authDriver.sendSignInLinkToEmail(email, actionCodeSettings)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    isSignInWithEmailLink(emailLink: string): boolean {
        return this.authDriver.isSignInWithEmailLink(emailLink)
    }

    fetchSignInMethodsForEmail(email: string): ReactivePromise<string[]> {
        let promise = new ReactivePromise<string[]>()
        this.authDriver.fetchSignInMethodsForEmail(email)
            .then((methods) => promise.resolve(methods))
            .catch(error => promise.reject(error))

        return promise
    }

    confirmPasswordReset(verificationCode: string, newPassword: string): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.authDriver.confirmPasswordReset(verificationCode, newPassword)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    applyActionCode(code: string): ReactivePromise<void> {
        let promise = new ReactivePromise<void>()
        this.authDriver.applyActionCode(code)
            .then(() => promise.resolve())
            .catch(error => promise.reject(error))

        return promise
    }

    checkActionCode(code: string): ReactivePromise<firebase.auth.ActionCodeInfo> {
        let promise = new ReactivePromise<firebase.auth.ActionCodeInfo>()
        this.authDriver.checkActionCode(code)
            .then((codeInfo) => promise.resolve(codeInfo))
            .catch(error => promise.reject(error))

        return promise
    }
}

class AuthProvidersList {
    get Google() {
        return new firebase.auth.GoogleAuthProvider()
    }
}

export const AuthProviders = new AuthProvidersList()

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

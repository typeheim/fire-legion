import {
    StatefulStream,
    AsyncStream,
} from '@typeheim/fire-rx'
import * as firebase from 'firebase'
import { User } from 'firebase'
import { map } from 'rxjs/operators'

export class AuthSession {
    protected firebaseAuth: firebase.auth.Auth
    public userStream: StatefulStream<User>
    public isLoggedInStream: StatefulStream<boolean>
    public authStateStream: StatefulStream<AuthState>
    public idTokenStream: StatefulStream<firebase.auth.IdTokenResult>

    setAuthDriver(driver: firebase.auth.Auth) {
        this.firebaseAuth = driver

        this.userStream = new StatefulStream((context) => {
            this.firebaseAuth.onAuthStateChanged({
                next: user => context.next(user),
                error: error => context.fail(error),
                complete: () => context.stop(),
            })
        })

        this.authStateStream = new StatefulStream((context) => {
            this.firebaseAuth.onAuthStateChanged({
                next: (user: User) => {
                    let state = null
                    if (user) {
                        state = new AuthState(AuthStateType.isAuthorised)
                    } else if (user && user.isAnonymous) {
                        state = new AuthState(AuthStateType.isAnonymous)
                    } else {
                        state = new AuthState(AuthStateType.isUnauthorised)
                    }
                    context.next(state)
                },
                error: error => context.fail(error),
                complete: () => context.stop(),
            })
        })
        this.isLoggedInStream = new StatefulStream((context) => {
            this.firebaseAuth.onAuthStateChanged({
                next: user => {
                    context.next(user || (user && user.isAnonymous))
                },
                error: error => context.fail(error),
                complete: () => context.stop(),
            })
        })
        this.idTokenStream = new StatefulStream((context) => {
            this.firebaseAuth.onIdTokenChanged({
                next: async (user: User) => context.next(await user.getIdTokenResult()),
                error: error => context.fail(error),
                complete: () => context.stop(),
            })
        })
    }

    getToken(forceRefresh = false): AsyncStream<string> {
        return new AsyncStream(this.userStream.pipe(map(async (user) => await user.getIdToken(forceRefresh))))
    }

    getTokenInfo(forceRefresh = false): AsyncStream<firebase.auth.IdTokenResult> {
        return new AsyncStream(this.userStream.pipe(map(async (user) => await user.getIdTokenResult(forceRefresh))))
    }

    async signOut(): Promise<void> {
        return this.firebaseAuth.signOut()
    }
}

export class AuthState {
    constructor(protected state: AuthStateType) {}

    isLoggedIn(): boolean {
        return this.state === AuthStateType.isAuthorised
    }

    /**
     * @deprecated
     */
    isAuthorised(): boolean {
        return this.state === AuthStateType.isAuthorised
    }

    isUnauthorised(): boolean {
        return this.state === AuthStateType.isUnauthorised
    }

    isAnonymous(): boolean {
        return this.state === AuthStateType.isAnonymous
    }
}

export enum AuthStateType {
    isAuthorised,
    isAnonymous,
    isUnauthorised
}

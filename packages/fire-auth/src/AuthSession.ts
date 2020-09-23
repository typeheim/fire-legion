import {
    StatefulStream,
    AsyncStream,
} from '@typeheim/fire-rx'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import {
    map,
    switchMap,
} from 'rxjs/operators'
import { of } from 'rxjs'

export class AuthSession {
    protected authDriver: firebase.auth.Auth
    public userStream: StatefulStream<firebase.User>
    public isLoggedInStream: AsyncStream<boolean>
    public authStateStream: AsyncStream<AuthState>
    public accessTokenStream: AsyncStream<string>
    public idTokenStream: StatefulStream<firebase.auth.IdTokenResult>

    setAuthDriver(driver: firebase.auth.Auth) {
        this.authDriver = driver

        this.userStream = new StatefulStream((context) => {
            this.authDriver.onAuthStateChanged({
                next: user => context.next(user),
                error: error => context.fail(error),
                complete: () => context.stop(),
            })
        })

        this.authStateStream = new AsyncStream(this.userStream.pipe(map((user: firebase.User) => {
            let state = null
            if (user) {
                state = new AuthState(AuthStateType.isAuthorised)
            } else if (user && user?.isAnonymous) {
                state = new AuthState(AuthStateType.isAnonymous)
            } else {
                state = new AuthState(AuthStateType.isUnauthorised)
            }
            return state
        })))

        this.isLoggedInStream = new AsyncStream(this.userStream.pipe(map((user: firebase.User) => {
            return !!(user || (user && user?.isAnonymous))
        })))

        this.accessTokenStream = new AsyncStream(this.userStream.pipe(switchMap(user => user ? user?.getIdToken() : of(null))))

        this.idTokenStream = new StatefulStream((context) => {
            this.authDriver.onIdTokenChanged({
                next: async (user: firebase.User) => {
                    if (user) {
                        context.next(await user?.getIdTokenResult())
                    } else {
                        context.next(null)
                    }
                },
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
        return this.authDriver.signOut()
    }

    destroy() {
        this.userStream.stop()
        this.idTokenStream.stop()
    }
}

export class AuthState {
    constructor(protected state: AuthStateType) {}

    isLoggedIn(): boolean {
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

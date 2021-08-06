import {
    AsyncStream,
    StatefulStream,
} from '@typeheim/fire-rx'
import firebase from 'firebase/app'
import 'firebase/auth'
import {
    map,
    shareReplay,
} from 'rxjs/operators'

export class AuthSession {
    protected authDriver: firebase.auth.Auth
    public userStream: StatefulStream<firebase.User>
    public isAnonymousStream: AsyncStream<boolean>
    public isLoggedInStream: AsyncStream<boolean>
    public authStateStream: AsyncStream<AuthState>
    public accessTokenStream: AsyncStream<string>
    public idTokenStream: StatefulStream<firebase.auth.IdTokenResult>
    private tokenTimer: any

    setAuthDriver(driver) {
        this.authDriver = driver

        this.userStream = new StatefulStream((context) => {
            this.authDriver.onAuthStateChanged({
                next: user => context.next(user),
                error: error => context.fail(error),
                complete: () => context.stop(),
            })
        })

        this.authStateStream = new AsyncStream(this.userStream.pipe(
            map((user: firebase.User) => {
                let state = null
                if (user && !user?.isAnonymous) {
                    state = new AuthState(AuthStateType.isAuthorised)
                } else if (user && user?.isAnonymous) {
                    state = new AuthState(AuthStateType.isAnonymous)
                } else {
                    state = new AuthState(AuthStateType.isUnauthorised)
                }
                return state
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
        ))

        this.isLoggedInStream = new AsyncStream(this.authStateStream.pipe(
            map(state => state?.isLoggedIn()),
            shareReplay({ bufferSize: 1, refCount: true }),
        ))

        this.isAnonymousStream = new AsyncStream(this.authStateStream.pipe(
            map(state => !state || state.isAnonymous()),
            shareReplay({ bufferSize: 1, refCount: true }),
        ))

        this.idTokenStream = new StatefulStream((context) => {
            this.authDriver.onIdTokenChanged({
                next: async (user: firebase.User) => {
                    if (!user) {
                        context.next(null)
                        return
                    }

                    let token = await user?.getIdTokenResult()
                    context.next(token)

                    this.scheduleTokenRefresh(token, user)
                },
                error: error => context.fail(error),
                complete: () => context.stop(),
            })
        })

        this.accessTokenStream = new AsyncStream(this.idTokenStream.pipe(
            map(idToken => idToken ? idToken?.token : null),
            shareReplay({ bufferSize: 1, refCount: true }),
        ))
    }

    protected scheduleTokenRefresh(token, user: firebase.User) {
        if (!user || !token) {
            return
        }

        // scheduling token refresh one minute before expiration
        let expirationDate = new Date(token.expirationTime)
        expirationDate.setMinutes(expirationDate.getMinutes() - 1)

        let timeoutMs = expirationDate.getTime() - Date.now()
        if (this.tokenTimer) {
            clearTimeout(this.tokenTimer)
        }
        this.tokenTimer = setTimeout(async () => {
            // refreshing token and triggering events
            await user?.getIdTokenResult(true)
        }, timeoutMs)
    }

    getToken(forceRefresh = false): AsyncStream<string> {
        return new AsyncStream(this.userStream.pipe(map(async (user) => await user?.getIdToken(forceRefresh))))
    }

    getTokenInfo(forceRefresh = false): AsyncStream<firebase.auth.IdTokenResult> {
        return new AsyncStream(this.userStream.pipe(map(async (user) => await user?.getIdTokenResult(forceRefresh))))
    }

    async signOut(): Promise<void> {
        return this.authDriver.signOut()
    }

    destroy() {
        this.userStream.complete()
        this.idTokenStream.complete()
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


import { ReactivePromise } from './ReactivePromise'

/**
 * Special type of subject that should be used in pair with `until` method of
 * Fire subjects to complete them.
 */
export class DestroyEvent extends ReactivePromise<boolean> {
     public emit() {
        this.resolve(true)
    }
}

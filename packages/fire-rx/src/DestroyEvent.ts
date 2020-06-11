import { ReplaySubject } from 'rxjs'
/**
 * Special type of subject that should be used in pair with `until` method of
 * Fire subjects to complete them.
 */
export class DestroyEvent extends ReplaySubject<boolean> {
     public emit() {
        this.next(true)
        this.complete()
        this.unsubscribe()
    }
}

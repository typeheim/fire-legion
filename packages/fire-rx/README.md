# FireRx 

RxJS on steroids. Adds memory safety and garbage collection  features to work with subjects and subscriptions. 
Adds subjects that behave both like subjects and promises to support async/await. 


## StatefulSubject
StatefulSubject acts as ReplaySubject and Promise so that you can use async/await operators on it as well as regular Subject methods. 
Adds memory safety and garbage collection automatically calling unsubscribe on subscriptions.
```typescript
import { StatefulSubject } from '@typeheim/fire-rx'

let subject = new StatefulSubject<number>(1)

subject.next(5)  
await subject // returns 5

subject.next(6)
await subject // returns 6

subject.stop() // completes subject and unsubscribe all subscriptions
```

## ReactivePromise
ReactivePromise acts as a regular Promise but additionally let you use `subscribe` and `pipe` methods. ReactivePromise, like 
StatefulSubject, buffers resolved value and can distribute it to multiple subscribers. 
ReactivePromise is memory-safe and unsubscribe subscriptions once it's resolved. 

```typescript
import { ReactivePromise } from '@typeheim/fire-rx'

let promise = new ReactivePromise<number>()

promise.resolve(5)
await promise // returns 5
promise.subscribe(value => console.log(value)) // returns 5 

//..............

let promise = new ReactivePromise<number>((resolve, reject) => {
    resolve(5)
})

promise.subscribe(value => console.log(value)) // returns 5 
```

## StatefulProducer
StatefulProducer extends ReplaySubject from RxJS and adds memory safety and garbage collection.
```typescript
import { StatefulProducer } from '@typeheim/fire-rx'

let subject = new StatefulProducer<number>(1)

subject.next(5) // emits to all subscriptions 5
subject.stop() // completes subject and unsubscribe all subscriptions
```

## ValueSubject
ValueSubject extends BehaviorSubject from RxJS and adds memory safety, garbage collection and Promise interface so that you can use async/await operators on it.
```typescript
import { ValueSubject } from '@typeheim/fire-rx'

let subject = new ValueSubject<number>(0)

subject.next(5)
await subject // returns 5

subject.next(6)
await subject // returns 6

subject.stop() // completes subject and unsubscribe all subscriptions
```

## SubscriptionsHub
SubscriptionsHub represents a hub of subscriptions that let you massively unsubscribe them at once. It might be useful to trigger
at object destruction to free resources
```typescript
import { SubscriptionsHub, StatefulSubject } from '@typeheim/fire-rx'

class Sample {
    protected hub: SubscriptionsHub = new SubscriptionsHub()
    
    doSomething() {
        let subject = new StatefulSubject<number>()
        
        this.hub.add(subject.subscribe(data => console.log(data)))
    }
    
    onDestroy() {
        this.hub.unsubscribe()
    }
}
```

## DestroyEvent
DestroyEvent is a special reactive class that servers as a destruction notifier and can be used in pair with Fire subjects or
with SubscriptionsHub

```typescript
import { DestroyEvent, SubscriptionsHub, StatefulSubject } from '@typeheim/fire-rx'

class Sample {
    protected destroyEvent: DestroyEvent = new DestroyEvent()
    protected hub: SubscriptionsHub = new SubscriptionsHub(this.destroyEvent)

    doSomething() {
        let subject = new StatefulSubject<number>()

        this.hub.add(subject.subscribe(data => console.log(data)))

        let anotherSubject = new StatefulSubject<number>()
        
        subject.until(this.destroyEvent).subscribe(data => console.log(data))
    }

    onDestroy() {
        this.destroyEvent.emit()
    }
}
```

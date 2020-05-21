#FireRx 

RxJS extension that provides async capabilities to subjects

```typescript
import { FireReplaySubject } from '@typeheim/fire-rx'


let subject = new FireReplaySubject<number>(1)

subject.next(5)
await subject // returns 5

subject.next(6)
await subject // returns 6
```

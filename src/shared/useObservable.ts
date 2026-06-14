import { useEffect, useState } from "react";
import type { Observable } from "rxjs";

// Subscribe to an RxJS stream and re-render with its latest value. Handles
// cleanup so subscriptions don't leak across mount/unmount. Pass a
// BehaviorSubject's current value as `initial` for synchronous first render.
export const useObservable = <T>(source$: Observable<T>, initial: T): T => {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const sub = source$.subscribe(setValue);

    return () => sub.unsubscribe();
  }, [source$]);

  return value;
};

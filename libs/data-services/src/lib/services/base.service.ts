import { inject, Signal, WritableSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { UseQuery } from '@ngneat/query';
import { combineLatest } from 'rxjs';

export class BaseService {
  useQuery = inject(UseQuery);
  signalsToObservable(
    signals: (WritableSignal<unknown> | Signal<unknown> | undefined)[]
  ) {
    return combineLatest(
      signals.filter(x => Boolean(x)).map(x => toObservable(x!))
    );
  }
}

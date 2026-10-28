import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  Observable, 
  Subject, 
  BehaviorSubject, 
  ReplaySubject, 
  AsyncSubject, 
  of, 
  from, 
  interval, 
  combineLatest, 
  forkJoin, 
  merge, 
  Subscription,
  throwError
} from 'rxjs';
import { 
  map, 
  filter, 
  tap, 
  debounceTime, 
  distinctUntilChanged, 
  switchMap, 
  mergeMap, 
  concatMap, 
  catchError, 
  take, 
  scan 
} from 'rxjs/operators';

interface TopicItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  codeSnippet: string;
}

@Component({
  selector: 'app-rxjs-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rxjs.html',
  styleUrl: './rxjs.css'
})
export class RxjsPage implements OnDestroy {
  activeTab = signal<string>('core');
  logs = signal<string[]>([]);
  private subs = new Subscription();

  // Async pipe demonstration observable
  timer$ = interval(1000).pipe(
    map(v => `Tick #${v} (${v + 1}s elapsed)`)
  );

  // Reference Code & Explanations database
  readonly topics: Record<string, TopicItem[]> = {
    core: [
      {
        id: 'observable',
        title: 'Observable & Observer Lifecycle',
        badge: 'Fundamental',
        description: 'An Observable pushes values to an Observer through 3 callbacks: next() (emits value), complete() (clean finish), and error() (halts on issue).',
        codeSnippet: `const custom$ = new Observable<string>(sub => {
  sub.next('Payload #1');
  sub.next('Payload #2');
  setTimeout(() => {
    sub.next('Payload #3 (async)');
    sub.complete();
  }, 600);
});

custom$.subscribe({
  next: val => console.log(val),
  complete: () => console.log('Done!'),
  error: err => console.error(err)
});`
      },
      {
        id: 'creation',
        title: 'Creation Operators (of, from, interval)',
        badge: 'Creation',
        description: 'Easily turn static data, Arrays, Promises, or timers into reactive data streams.',
        codeSnippet: `// of: emits items in sequence then completes
of('Angular', 'RxJS', 'Signals').subscribe(console.log);

// from: converts Array / Iterable / Promise
from([10, 20, 30]).subscribe(console.log);

// interval + take: emits counting numbers on fixed cadence
interval(500).pipe(take(3)).subscribe(console.log);`
      },
      {
        id: 'async-pipe',
        title: 'Async Pipe (| async)',
        badge: 'Template Best Practice',
        description: 'Subscribes directly in Angular templates, automatically detects changes, and unsubscribes when the component destroys.',
        codeSnippet: `// In Component:
readonly timer$ = interval(1000);

// In Template (Zero manual unsubscribe needed!):
<div>{{ timer$ | async }}</div>`
      }
    ],
    subjects: [
      {
        id: 'subject',
        title: 'Subject (Plain Multicast)',
        badge: 'Multicast',
        description: 'Acts as both Observable and Observer. Emits to existing subscribers only; late subscribers do NOT receive past emissions.',
        codeSnippet: `const subject = new Subject<number>();
subject.subscribe(v => console.log('Sub 1:', v));
subject.next(100);

// Sub 2 registers after 100 was emitted -> misses 100!
subject.subscribe(v => console.log('Sub 2:', v));
subject.next(200);`
      },
      {
        id: 'behavior-subject',
        title: 'BehaviorSubject (State Store)',
        badge: 'State Favorite',
        description: 'Requires an initial seed value. Any subscriber (even late) immediately receives the current latest value upon subscribing.',
        codeSnippet: `const currentTheme$ = new BehaviorSubject<string>('light');

// Gets 'light' immediately
currentTheme$.subscribe(t => console.log('Sub 1:', t));

currentTheme$.next('dark');

// Late subscriber immediately receives 'dark'!
currentTheme$.subscribe(t => console.log('Sub 2 (late):', t));`
      },
      {
        id: 'replay-subject',
        title: 'ReplaySubject (Historical Buffer)',
        badge: 'Buffer',
        description: 'Records and replays a specified number of prior emissions to any new late subscribers.',
        codeSnippet: `const notifications$ = new ReplaySubject<string>(2); // Buffer size 2
notifications$.next('Notice #1 (dropped)');
notifications$.next('Notice #2');
notifications$.next('Notice #3');

// Sub receives Notice #2 and #3 immediately
notifications$.subscribe(n => console.log('Replayed:', n));`
      },
      {
        id: 'async-subject',
        title: 'AsyncSubject (Final Value)',
        badge: 'Complete-only',
        description: 'Emits only the final value of the execution, and ONLY when the execution completes.',
        codeSnippet: `const calc$ = new AsyncSubject<number>();
calc$.subscribe(v => console.log('Result:', v));
calc$.next(10);
calc$.next(20);
calc$.next(42);
calc$.complete(); // Output is 42`
      }
    ],
    operators: [
      {
        id: 'map-filter-tap',
        title: 'Transformation (map, filter, tap)',
        badge: 'Core Operators',
        description: 'Pipe operators together: tap() allows side-effects/logging without mutating; filter() gates values; map() modifies each emission.',
        codeSnippet: `from([1, 2, 3, 4, 5, 6]).pipe(
  tap(n => console.log('Spy value:', n)),
  filter(n => n % 2 === 0), // Evens only [2, 4, 6]
  map(n => n * 10)          // [20, 40, 60]
).subscribe(console.log);`
      },
      {
        id: 'scan-operator',
        title: 'Scan Operator (Running Total)',
        badge: 'Aggregation',
        description: 'Applies an accumulator function over the source stream, emitting each intermediate result (like Array.reduce over time).',
        codeSnippet: `from([10, 20, 30]).pipe(
  scan((total, current) => total + current, 0)
).subscribe(sum => console.log('Running sum:', sum));
// Emits: 10, then 30, then 60`
      },
      {
        id: 'debounce-distinct',
        title: 'debounceTime & distinctUntilChanged',
        badge: 'Search / Input',
        description: 'Debounces bursts of rapid events (typing) and ignores duplicated values.',
        codeSnippet: `searchControl.valueChanges.pipe(
  debounceTime(300),        // Wait for 300ms pause
  distinctUntilChanged(),   // Only if query changed
  switchMap(q => api.search(q))
).subscribe(results => render(results));`
      }
    ],
    flattening: [
      {
        id: 'switch-map',
        title: 'switchMap (Cancel Previous)',
        badge: 'Autocomplete / Search',
        description: 'Switches to the new inner Observable and instantly CANCELS the prior running inner Observable. Avoids race conditions.',
        codeSnippet: `searchQueries$.pipe(
  switchMap(query => fetchResultsHttp(query))
  // If user types 'an' then quickly 'ang', 
  // the 'an' request is aborted automatically!
).subscribe(data => show(data));`
      },
      {
        id: 'merge-map',
        title: 'mergeMap (Concurrent / Parallel)',
        badge: 'Parallel Processing',
        description: 'Subscribes to all inner Observables concurrently without cancelling. Emits values as soon as any finish.',
        codeSnippet: `fileIds$.pipe(
  mergeMap(id => uploadFileHttp(id))
  // All file uploads run concurrently in parallel!
).subscribe(status => console.log(status));`
      },
      {
        id: 'concat-map',
        title: 'concatMap (Sequential Queue)',
        badge: 'Order Preserving',
        description: 'Waits for current inner Observable to complete before starting the next. Guarantees strict sequential ordering.',
        codeSnippet: `saveQueue$.pipe(
  concatMap(step => runSequentialStep(step))
  // Step 2 will NOT start until Step 1 completes!
).subscribe(res => console.log(res));`
      }
    ],
    combination: [
      {
        id: 'fork-join',
        title: 'forkJoin (Parallel Aggregation)',
        badge: 'Like Promise.all',
        description: 'Runs multiple Observables in parallel and waits for ALL of them to complete, then emits the final values as a dictionary or array.',
        codeSnippet: `forkJoin({
  user: http.get('/api/user'),
  settings: http.get('/api/settings'),
  permissions: http.get('/api/permissions')
}).subscribe(({ user, settings, permissions }) => {
  // All three APIs have finished!
});`
      },
      {
        id: 'merge-combine',
        title: 'merge (Blended Streams)',
        badge: 'Stream Union',
        description: 'Turns multiple Observables into a single stream by emitting values from each stream as they arrive.',
        codeSnippet: `merge(
  socketStream$,
  userClickStream$
).subscribe(event => handleEvent(event));`
      },
      {
        id: 'catch-error',
        title: 'catchError (Resilience & Fallback)',
        badge: 'Error Handling',
        description: 'Intercepts errors in the pipeline, preventing subscription death, and emits a fallback Observable instead.',
        codeSnippet: `http.get('/api/products').pipe(
  catchError(err => {
    console.error('API Failed:', err.message);
    return of([]); // Return empty list as graceful fallback!
  })
).subscribe(products => this.products = products);`
      }
    ]
  };

  private log(message: string): void {
    const time = new Date().toLocaleTimeString();
    this.logs.update(prev => [`[${time}] ${message}`, ...prev.slice(0, 49)]);
  }

  clearLogs(): void {
    this.logs.set([]);
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  // --- Live Interactive Action Handlers ---
  runObservableDemo(): void {
    this.log('▶ Starting Observable lifecycle demo...');
    const custom$ = new Observable<string>(sub => {
      sub.next('Payload #1');
      sub.next('Payload #2');
      setTimeout(() => {
        sub.next('Payload #3 (Delayed async emission)');
        sub.complete();
      }, 500);
    });

    const sub = custom$.subscribe({
      next: val => this.log(`next(): ${val}`),
      complete: () => this.log('complete(): Observable stream has finished cleanly!'),
      error: err => this.log(`error(): ${err}`)
    });
    this.subs.add(sub);
  }

  runCreationDemo(): void {
    this.log('▶ Testing of(), from(), interval()...');
    of('Angular', 'RxJS', 'TypeScript').subscribe(v => this.log(`of(): ${v}`));
    from(['Item #1', 'Item #2']).subscribe(v => this.log(`from(Array): ${v}`));
    interval(250).pipe(
      take(3),
      map(n => `interval tick #${n + 1}`)
    ).subscribe(v => this.log(v));
  }

  runSubjectDemo(type: 'subject' | 'behavior' | 'replay' | 'async'): void {
    this.log(`▶ Executing ${type.toUpperCase()} demo...`);
    if (type === 'subject') {
      const sub = new Subject<number>();
      sub.subscribe(v => this.log(`Subscriber A: ${v}`));
      sub.next(100);
      sub.subscribe(v => this.log(`Subscriber B (late, missed 100): ${v}`));
      sub.next(200);
    } else if (type === 'behavior') {
      const bSub = new BehaviorSubject<string>('Seed Value');
      bSub.subscribe(v => this.log(`Subscriber A (got initial): ${v}`));
      bSub.next('Updated Value');
      bSub.subscribe(v => this.log(`Subscriber B (late, immediately receives current): ${v}`));
    } else if (type === 'replay') {
      const rSub = new ReplaySubject<string>(2);
      rSub.next('History 1 (dropped)');
      rSub.next('History 2 (buffered)');
      rSub.next('History 3 (buffered)');
      rSub.subscribe(v => this.log(`Late Subscriber received buffer: ${v}`));
    } else if (type === 'async') {
      const aSub = new AsyncSubject<number>();
      aSub.subscribe(v => this.log(`Subscriber received upon complete: ${v}`));
      aSub.next(10);
      aSub.next(25);
      aSub.next(99);
      this.log('Calling complete() on AsyncSubject now...');
      aSub.complete();
    }
  }

  runTransformFilterDemo(): void {
    this.log('▶ Running pipeline: from([1,2,3,4,5,6]) -> tap -> filter -> map -> scan');
    from([1, 2, 3, 4, 5, 6]).pipe(
      tap(n => this.log(`tap (spy): ${n}`)),
      filter(n => n % 2 === 0),
      map(n => n * 10),
      scan((acc, curr) => acc + curr, 0)
    ).subscribe(res => {
      this.log(`Output running total (scan): ${res}`);
    });
  }

  runFlatteningDemo(type: 'switch' | 'merge' | 'concat'): void {
    this.log(`▶ Running ${type}Map demo on streams [Req#1, Req#2, Req#3]...`);
    const stream$ = from([1, 2, 3]);

    if (type === 'switch') {
      stream$.pipe(
        switchMap(id => of(`Response #${id}`).pipe(
          map(res => `switchMap -> ${res} (prior cancelled if active)`)
        ))
      ).subscribe(res => this.log(res));
    } else if (type === 'merge') {
      stream$.pipe(
        mergeMap(id => of(`Response #${id} processed in parallel`))
      ).subscribe(res => this.log(`mergeMap -> ${res}`));
    } else if (type === 'concat') {
      stream$.pipe(
        concatMap(id => of(`Response #${id} processed in sequential order`))
      ).subscribe(res => this.log(`concatMap -> ${res}`));
    }
  }

  runCombinationDemo(): void {
    this.log('▶ Executing forkJoin & merge...');
    forkJoin({
      user: of({ id: 1, name: 'Alice' }),
      cart: of(['Book', 'Pen']),
      status: of('Active')
    }).subscribe(data => {
      this.log(`forkJoin emitted all together: User=${data.user.name}, Items=${data.cart.length}, Status=${data.status}`);
    });

    merge(
      of('Stream A (Event from WebSocket)'),
      of('Stream B (Event from Button Click)')
    ).subscribe(msg => this.log(`merge emitted: ${msg}`));
  }

  runErrorHandlingDemo(): void {
    this.log('▶ Executing throwError -> catchError...');
    throwError(() => new Error('Simulated HTTP 500 Network Failure'))
      .pipe(
        catchError(err => {
          this.log(`catchError caught: "${err.message}"`);
          return of('Graceful Fallback Data: [] (Application didn\'t crash!)');
        })
      )
      .subscribe(val => this.log(`Subscriber received: ${val}`));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}

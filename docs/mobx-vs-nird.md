# MobX vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

**MobX** is "battle-tested libraries that makes state management simple and scalable by transparently applying functional reactive programming (TFRP)". It uses mutable observables and a dependency tracking engine.

**NirdJS** is an atomic state library that uses immutable atoms and functional updates.

---

## Key Differences

| Feature | MobX | NirdJS |
| :--- | :--- | :--- |
| **Data Flow** | Transparent (Automatic tracking) | Explicit (Manual subscription/updates) |
| **Data Style** | Mutable Observables / Proxies | Immutable Atoms / References |
| **Implicit vs Explicit** | Implicit (Components magically track variables) | Explicit (Hook into an atom) |
| **Traceability** | Can be hard to track what triggered an update | Every update is an explicit `.set()` or `.update()` |

---

## Syntax Comparison

### MobX

Uses `makeObservable` or `makeAutoObservable` and the `observer` HOC.

```ts
import { makeAutoObservable } from "mobx"
import { observer } from "mobx-react-lite"

class CounterStore {
  count = 0
  constructor() { makeAutoObservable(this) }
  increment() { this.count++ }
}

const Counter = observer(({ store }) => (
  <button onClick={() => store.increment()}>{store.count}</button>
))
```

### NirdJS

Uses `atom` and functional updates.

```ts
import { atom } from 'nirdjs';

const countAtom = atom(0);
const increment = () => countAtom.update(n => n + 1);

const Counter = () => {
  const count = useValue(countAtom);
  return <button onClick={increment}>{count}</button>;
}
```

---

## Why choose NirdJS over MobX?

1.  **No "Magic"**: MobX automatically tracks every variable access. While powerful, this can lead to surprising behavior and difficult debugging if dependencies aren't managed carefully. NirdJS is explicit: you subscribe to an atom, and it re-renders only when that atom changes.
2.  **Immutable-First**: NirdJS adheres to the React "one-way data flow" philosophy. State is immutable, and updates are functional.
3.  **No HOCs**: MobX requires wrapping every component in `observer()`. NirdJS uses a standard React hook (`useValue`).
4.  **Simpler Mental Model**: No need to learn decorators, Proxies, or the MobX dependency engine.

## When to choose MobX?

*   If you have extremely complex, deeply nested state objects where manual atomization would be too much work.
*   If you prefer a "mutable-feeling" development style.

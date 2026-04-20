# How to Pitch NirdJS

> **One sentence:** NirdJS lets you declare your state as plain JS objects outside React,
> then connect any component to any piece of that state with a single hook —
> no providers, no reducers, no boilerplate.

---

## Table of Contents

- [The Core Idea](#the-core-idea)
- [Zero Boilerplate Updates](#zero-boilerplate-updates)
- [Stable Function References](#stable-function-references)
- [Fine-Grained Reactivity](#fine-grained-reactivity)
- [Derived State is First-Class](#derived-state-is-first-class)
- [SSR-Safe Without a Provider Tree](#ssr-safe-without-a-provider-tree)
- [How NirdJS Compares](./zustand-vs-nird-comparison.md)
- [Redux Toolkit vs Nird](./redux-vs-nird.md)
- [Zustand vs Nird](./zustand-vs-nird.md)
- [Jotai vs Nird](./jotai-vs-nird.md)
- [Recoil vs Nird](./recoil-vs-nird.md)
- [MobX vs Nird](./mobx-vs-nird.md)
- [Context API vs Nird](./context-vs-nird.md)
- [Valtio vs Nird](./valtio-vs-nird.md)
- [XState vs Nird](./xstate-vs-nird.md)
- [TanStack Query vs Nird](./query-vs-nird.md)
- [Signals vs Nird](./signals-vs-nird.md)

---

## The Core Idea

Your atoms are **plain JavaScript objects** — not React context, not a framework.
You can read and write them from anywhere: event handlers, WebSocket callbacks, timers,
server actions. No hooks required outside of components.

```ts
// This works anywhere — no React, no hooks needed
import { userAtom } from './state';

ws.onmessage = (msg) => userAtom.set(JSON.parse(msg.data));
setTimeout(() => sessionAtom.set(null), 30_000);
```

Components simply subscribe to the atoms they need:

```tsx
import { useValue } from 'nirdjs';
import { userAtom } from './state';

const Avatar = () => {
  const user = useValue(userAtom);
  return <img src={user.avatarUrl} />;
};
```

---

## Zero Boilerplate Updates

No action types. No reducers. No selectors required for basic usage.

```ts
// Define state and actions in one place, outside React
const counterAtom = atom(0);

export const useCounter = () => useValue(counterAtom);
export const inc = () => counterAtom.update(n => n + 1);
export const dec = () => counterAtom.update(n => n - 1);
export const reset = () => counterAtom.set(0);
```

```tsx
// Component is pure display — no logic
const Counter = () => {
  const count = useCounter();
  return (
    <>
      <button onClick={dec}>−</button>
      <span>{count}</span>
      <button onClick={inc}>+</button>
    </>
  );
};
```

---

## Stable Function References

`inc`, `dec`, and `reset` above are defined **once at module level**.
They never change identity. This means:

- No `useCallback` needed to prevent re-renders when passing them as props.
- No stale closure bugs.
- Actions can be imported and called directly from tests, without mounting components.

---

## Fine-Grained Reactivity

Only components that subscribe to a changed atom re-render.
Unrelated components are completely untouched — no `React.memo` needed for basic cases.

```ts
const nameAtom = atom("Alice");
const ageAtom  = atom(30);

// When ageAtom changes, NameDisplay does NOT re-render
const NameDisplay = () => <p>{useValue(nameAtom)}</p>;
const AgeDisplay  = () => <p>{useValue(ageAtom)}</p>;
```

---

## Derived State is First-Class

Use `derive` to create atoms whose value is always computed from another atom.
The derived atom updates automatically whenever the source changes.

```ts
import { atom, derive, NeverSet } from 'nirdjs';

const wordAtom    = atom("compatibility");
const lengthAtom  = derive(wordAtom, word => word.length, NeverSet); // read-only

export const useWord   = () => useValue(wordAtom);
export const useLength = () => useValue(lengthAtom);
export const setWord   = (w: string) => wordAtom.set(w);
```

For object atoms, `propertyAtom` creates a two-way binding to a single property:

```ts
import { atom, propertyAtom } from 'nirdjs';

const userAtom  = atom({ name: "Alice", age: 30 });
const nameAtom  = propertyAtom(userAtom, "name"); // read + write
```

---

## SSR-Safe Without a Provider Tree

Most state libraries require wrapping your app in a `<Provider>` to isolate per-request
state on the server. NirdJS uses Node's `AsyncLocalStorage` instead, so each server
request gets its own isolated store with zero changes to your component tree.

```ts
import { execWithAtom, createAtomStore, disableDefaultStore, setStoreProvider, asyncLocalStorageStoreProvider } from 'nirdjs/ssr';

// Once, at server startup:
disableDefaultStore();
setStoreProvider(asyncLocalStorageStoreProvider);

// Per request:
const html = execWithAtom(createAtomStore(), () => {
  userAtom.set(req.user);
  return renderToString(<App />);
});
```

No `<Provider store={...}>`. No prop drilling. No accidental state leakage between
concurrent requests.

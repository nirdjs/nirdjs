<p align="center">
  <h1 align="center">nirdjs</h1>
  <p align="center">
    Atomic state management for React — tiny, fast, SSR-ready.
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/nirdjs"><img src="https://img.shields.io/npm/v/nirdjs.svg?style=flat-square&color=blue" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/nirdjs"><img src="https://img.shields.io/npm/dm/nirdjs.svg?style=flat-square" alt="npm downloads" /></a>
    <a href="https://bundlephobia.com/package/nirdjs"><img src="https://img.shields.io/bundlephobia/minzip/nirdjs?style=flat-square&label=bundle" alt="bundle size" /></a>
    <a href="https://github.com/nirdjs/nirdjs/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/nirdjs.svg?style=flat-square" alt="license" /></a>
  </p>
</p>

---

## Why nirdjs?

| | nirdjs | Redux | Zustand | Jotai |
|---|---|---|---|---|
| **Bundle size** | ~2 KB | ~7 KB | ~3 KB | ~8 KB |
| **Boilerplate** | None | Heavy | Light | Light |
| **SSR isolation** | Built-in | Manual | Manual | Provider |
| **Derived state** | `derive()` | Selectors | Middleware | Derived atoms |
| **Batching** | Deduplicated | Middleware | — | — |
| **TypeScript** | First-class | Verbose | Good | Good |

**nirdjs** gives you atoms that live _outside_ React. No providers, no context, no reducers. Just declare → use → done.

---

## Install

```sh
npm install nirdjs
# or
bun add nirdjs
# or
pnpm add nirdjs
```

---

## Quick Start

```tsx
// counterAtom.ts — define once, import anywhere
import { atom, useValue } from 'nirdjs';

const counterAtom = atom(0);

export const useCounter = () => useValue(counterAtom);
export const inc = () => counterAtom.update(prev => prev + 1);
export const dec = () => counterAtom.update(prev => prev - 1);
export const reset = () => counterAtom.reset();
```

```tsx
// Counter.tsx
import { useCounter, inc, dec, reset } from './counterAtom';

export const Counter = () => {
  const count = useCounter();

  return (
    <div>
      <span>{count}</span>
      <button onClick={dec}>−</button>
      <button onClick={inc}>+</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
```

That's it. `useCounter()` subscribes the component. `inc`, `dec`, and `reset` are plain functions — call them from anywhere: event handlers, effects, other modules, even outside React.

---

## Core API

### `atom(initialValue, config?)`

Creates a reactive atom. This is the fundamental building block.

```ts
import { atom } from 'nirdjs';

const nameAtom = atom('Alice');

nameAtom.get();          // 'Alice'
nameAtom.set('Bob');     // set directly
nameAtom.update(n => n.toUpperCase()); // update from previous value
```

| Method | Description |
|---|---|
| `.get()` | Returns the current value |
| `.set(value)` | Sets a new value, notifies subscribers |
| `.update(fn)` | Applies `fn(currentValue)` and sets the result |
| `.sub(fn)` | Subscribe to changes — `fn(nextValue, prevValue)` |
| `.unsub(fn)` | Unsubscribe |
| `.toString()` | Debug-friendly string representation |

#### Config options

```ts
const atom = atom(value, {
  debugLabel: 'myAtom',        // label for debugging
  ignoreWhen: (prev, next) =>  // skip notification when true
    prev === next,             // (default: strict equality + NaN handling)
  allowFnValue: false,         // set to true to store functions as values
});
```

### `useValue(atom)`

React hook that subscribes the component to an atom. Re-renders only when the atom's value changes.

```tsx
import { atom, useValue } from 'nirdjs';

const themeAtom = atom<'light' | 'dark'>('dark');

const ThemeIndicator = () => {
  const theme = useValue(themeAtom);
  return <span>Current theme: {theme}</span>;
};
```

---

## Derived State

### `derive(source, get, set, config?)`

Creates an atom that derives its value from a source atom. Changes flow in both directions.

```ts
import { atom, derive, NeverSet } from 'nirdjs';

const userAtom = atom({ first: 'Ada', last: 'Lovelace' });

// Read-only derived atom
const fullNameAtom = derive(
  userAtom,
  user => `${user.first} ${user.last}`,
  NeverSet, // marks this atom as read-only
);

fullNameAtom.get(); // 'Ada Lovelace'
```

```ts
// Read-write derived atom
const celsiusAtom = atom(0);

const fahrenheitAtom = derive(
  celsiusAtom,
  c => c * 9 / 5 + 32,           // celsius → fahrenheit
  (f) => (f - 32) * 5 / 9,       // fahrenheit → celsius
);

fahrenheitAtom.set(212);
celsiusAtom.get(); // 100
```

### `propertyAtom(source, key, config?)`

Shorthand for deriving a single property from an object atom. Read-write by default.

```ts
import { atom, propertyAtom } from 'nirdjs';

const settingsAtom = atom({ volume: 80, muted: false });

const volumeAtom = propertyAtom(settingsAtom, 'volume');
volumeAtom.set(50); // settingsAtom is now { volume: 50, muted: false }
```

---

## Arrays

### `splitAtom(source, itemConfig?, containerConfig?)`

Splits an array atom into an array of individual item atoms. Changing one item re-renders only that item's subscribers — not the entire list.

```ts
import { atom, splitAtom, useValue } from 'nirdjs';

const todosAtom = atom(['Buy milk', 'Write code', 'Ship it']);
const todoAtomsAtom = splitAtom(todosAtom);

const TodoList = () => {
  const todoAtoms = useValue(todoAtomsAtom);
  return (
    <ul>
      {todoAtoms.map((todoAtom, i) => (
        <TodoItem key={i} atom={todoAtom} />
      ))}
    </ul>
  );
};

const TodoItem = ({ atom }: { atom: Atom<string> }) => {
  const text = useValue(atom);
  return <li>{text}</li>;
};
```

### `updateElt(arrayAtom, index, updateFn)`

Update a single element by index without replacing the whole array.

```ts
import { atom, updateElt } from 'nirdjs';

const scores = atom([10, 20, 30]);
updateElt(scores, 1, prev => prev + 5); // [10, 25, 30]
```

---

## Batching

Wrap multiple atom updates in `batch()` to defer notifications until the end. Notifications are **deduplicated per atom** — if you set the same atom 10 times, subscribers fire only once with the final value.

```ts
import { atom, batch } from 'nirdjs';

const x = atom(0);
const y = atom(0);

await batch(() => {
  x.set(1);
  y.set(1);
  x.set(2);  // overwrites the first x.set
  y.set(2);  // overwrites the first y.set
});
// x subscribers called once with (2, 0)
// y subscribers called once with (2, 0)
```

Nested batches are supported — notifications flush when the outermost batch completes.

---

## Helpers

```ts
import { atomSetter, atomGetter } from 'nirdjs';

const darkModeAtom = atom(false);

// Create standalone getter/setter functions
export const getDarkMode = atomGetter(darkModeAtom);  // () => boolean
export const setDarkMode = atomSetter(darkModeAtom);  // (value: boolean) => void
```

---

## SSR

For server-side rendering, each request must have its own isolated store. nirdjs provides `AsyncLocalStorage`-based isolation out of the box.

```tsx
import { atom, useValue } from 'nirdjs';
import {
  disableDefaultStore,
  setStoreProvider,
  createAtomStore,
} from 'nirdjs';
import {
  asyncLocalStorageStoreProvider,
  execWithAtom,
} from 'nirdjs/ssr/AsyncLocalStorageAtomProvider';

// 1. Disable the global default store
disableDefaultStore();
setStoreProvider(asyncLocalStorageStoreProvider);

// 2. Each request gets its own store
const pageAtom = atom('');

app.get('/', (req, res) => {
  const html = execWithAtom(createAtomStore(), () => {
    pageAtom.set(req.url);
    return renderToString(<App />);
  });
  res.send(html);
});
```

Two concurrent requests will never share state — each runs in its own `AsyncLocalStorage` context.

---

## TypeScript

nirdjs is written in TypeScript. All atoms are fully typed — generics propagate through `derive`, `propertyAtom`, `splitAtom`, and `useValue` automatically.

```ts
// Type is inferred as Atom<{ name: string; age: number }>
const userAtom = atom({ name: 'Alice', age: 30 });

// Type is inferred as Atom<string>
const nameAtom = propertyAtom(userAtom, 'name');

// Explicit generic when needed
const idAtom = atom<string | null>(null);
```

---

## API Reference

| Export | Description |
|---|---|
| `atom(value, config?)` | Create a reactive atom |
| `useValue(atom)` | React hook — subscribe a component to an atom |
| `derive(source, get, set, config?)` | Create a derived atom from a source atom |
| `NeverSet` | Pass as the setter to `derive()` for read-only atoms |
| `propertyAtom(source, key, config?)` | Derive a single property of an object atom |
| `splitAtom(source)` | Split an array atom into individual item atoms |
| `updateElt(arrayAtom, i, fn)` | Update one element in an array atom |
| `batch(fn)` | Batch updates, deduplicate notifications |
| `atomSetter(atom)` | Create a standalone setter function |
| `atomGetter(atom)` | Create a standalone getter function |
| `createAtomStore()` | Create an isolated store (for SSR) |
| `disableDefaultStore()` | Disable the global store (for SSR) |
| `setStoreProvider(fn)` | Set a custom store resolver |
| `isIdentical` | Default equality check (`===` + NaN) |
| `neverIgnore` | Config value to always notify on set |

---

## License

[Apache-2.0](./LICENSE) — Dima Kaigorodov

## Links

- [GitHub](https://github.com/nirdjs/nirdjs)
- [npm](https://www.npmjs.com/package/nirdjs)

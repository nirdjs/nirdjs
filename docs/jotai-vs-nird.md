# Jotai vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

Both **Jotai** and **NirdJS** are "atomic" state management libraries inspired by Recoil. They both aim to solve the "prop drilling" and "unnecessary re-rendering" problems by breaking state into small, independent pieces.

---

## Key Differences

| Feature | Jotai | NirdJS |
| :--- | :--- | :--- |
| **Store Storage** | React Context (needs a `<Provider>`) | Global `Store` (browser) / `AsyncLocalStorage` (SSR) |
| **Non-React Access** | Requires `store.get(atom)` from a store instance | `atom.get()` directly, anywhere |
| **SSR Strategy** | Relies on React's tree-based isolation | Uses Node's `AsyncLocalStorage` for flat isolation |
| **Bundle Size** | ~3 KB | ~1 KB |

---

## Syntax Comparison

### Jotai

Atoms are "inert" definitions. They don't hold values themselves; the store does.

```ts
import { atom } from 'jotai';

const countAtom = atom(0);

// In a component
const [count, setCount] = useAtom(countAtom);
```

### NirdJS

Atoms are "live" objects. They hold their own value and subscriptions.

```ts
import { atom } from 'nirdjs';

const countAtom = atom(0);

// In a component
const count = useValue(countAtom);
const increment = () => countAtom.set(c => c + 1);
```

---

## Why choose NirdJS over Jotai?

1.  **Outside React**: NirdJS atoms are much easier to work with in non-React code (e.g., a background WebSocket handler). You don't need to pass a store reference around.
2.  **Simpler SSR**: NirdJS's `AsyncLocalStorage` approach for SSR means you don't need to wrap your entire app in a `<Provider>` tree just to isolate state per-request.
3.  **Explicit Derivation**: NirdJS's `derive` and `propertyAtom` APIs are explicitly designed for common data transformation patterns.

## When to choose Jotai?

*   If you prefer the `[value, setter] = useAtom(atom)` hook style (though NirdJS can be easily wrapped to match this).
*   If you need a more mature ecosystem of utilities (e.g., `jotai/utils`).

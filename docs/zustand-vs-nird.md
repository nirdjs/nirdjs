# Zustand vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

**Zustand** is a small, fast, and scalable bear-bones state-management solution using simplified flux principles. It's famous for its minimal API and for not requiring a `<Provider>` in the browser.

**NirdJS** shares the "no-provider" and "minimal API" philosophy but uses an **atomic** model instead of a single-store model.

---

## Key Differences

| Feature | Zustand | NirdJS |
| :--- | :--- | :--- |
| **Model** | Single Store (Object) | Atomic (Independent pieces) |
| **Re-render Control** | Manual (Selectors required: `s => s.foo`) | Automatic (Subscribing to an atom) |
| **Granularity** | Coarse (The whole store is one object) | Fine (Every atom is its own unit) |
| **Logic Location** | Inside the store creator | Shared via atom updates/helpers |

---

## Syntax Comparison

### Zustand

Requires selectors to prevent unnecessary re-renders when other parts of the store change.

```ts
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))

function Counter() {
  const count = useStore((state) => state.count) // Selector required
  const inc = useStore((state) => state.inc)
  return <button onClick={inc}>{count}</button>
}
```

### NirdJS

Selectivity is built-in. You only subscribe to what you need.

```ts
import { atom, useValue } from 'nirdjs'

const countAtom = atom(0)
const inc = () => countAtom.update(n => n + 1)

function Counter() {
  const count = useValue(countAtom) // Naturally granular
  return <button onClick={inc}>{count}</button>
}
```

---

## Why choose NirdJS over Zustand?

1.  **True Granularity**: In Zustand, if you have a store with 50 fields, you have to write 50 selectors (or one very complex one) to ensure components only re-render when their specific field changes. In NirdJS, you just use the atom you need.
2.  **No "Store" Management**: You don't need to decide which fields belong in which store. Every piece of state is an independent atom that can be composed using `derive`.
3.  **Atomic Composition**: NirdJS's `derive` allows you to create new state based on multiple atoms very easily, whereas combining state from multiple Zustand stores requires extra coordination.
4.  **Simpler SSR**: NirdJS's `AsyncLocalStorage` isolation for SSR is often easier to reason about than managing multiple store instances per request in Zustand.

## When to choose Zustand?

*   If you prefer having all related state and actions in a single, centralized object.
*   If you are already comfortable with the Redux-like "dispatcher/reducer" mental model (even though Zustand simplifies it significantly).

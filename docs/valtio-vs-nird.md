# Valtio vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

**Valtio** is "no-boilerplate proxy-based state management". It works by wrapping your state objects in a proxy and tracking which parts you access in your component. This gives it a "magic" mutable-feeling developer experience.

**NirdJS** is an "atomic-based state management" library. It uses explicit atoms and functional updates to manage state.

---

## Key Differences

| Feature | Valtio | NirdJS |
| :--- | :--- | :--- |
| **State Style** | Proxied (Mutable-feeling) | Atomic (Immutable and functional) |
| **Re-render Tracking** | Implicit (Tracks which property you access) | Explicit (You subscribe to a specific atom) |
| **Tracking Magic** | High (Components re-render based on property access) | Low (Components re-render based on atom changes) |
| **Traceability** | Update site might be hard to find in a large app | Every update is an explicit `.set()` or `.update()` |

---

## Syntax Comparison

### Valtio

Uses the `proxy` function and the `useSnapshot` hook.

```ts
import { proxy, useSnapshot } from 'valtio';

const state = proxy({ count: 0 });

const Counter = () => {
  const snap = useSnapshot(state);
  return <button onClick={() => state.count++}>{snap.count}</button>;
}
```

### NirdJS

Uses the `atom` function and the `useValue` hook.

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

## Why choose NirdJS over Valtio?

1.  **Explicitness**: Valtio's "magic" property tracking (proxy based) can sometimes be hard to trace in complex codeflows. NirdJS is explicit about what state is being watched and where it's being updated.
2.  **No Proxy Limitations**: While modern proxies are powerful, they can occasionally have issues with certain debugging tools or edge-case JS environments. NirdJS uses standard JS object references.
3.  **Predictable Architecture**: NirdJS forces you to think in terms of independent "atoms" of state, which usually leads to a cleaner, more decoupled architecture than a large global proxy object.

## When to choose Valtio?

*   If you find the functional update style (`prev => prev + 1`) too verbose.
*   If you want a "just mutate it" experience that automatically works with React.

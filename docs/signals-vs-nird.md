# Signals (Preact/Angular style) vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

**Signals** are a state management primitive that has gained a lot of popularity recently. They provide fine-grained reactivity by automatically tracking dependencies and updating only the parts of the DOM that change. Libraries like `@preact/signals-react` and Angular's new Signal system are the main examples.

**NirdJS** is an "atomic-based state management" library. It uses explicit atoms and React hooks to manage state.

---

## Key Differences

| Feature | Signals | NirdJS |
| :--- | :--- | :--- |
| **Reactivity** | Automatic / Bypass React (Optional) | Explicit / React-integrated |
| **Data Style** | Direct Signal value access | Functional updates and Atoms |
| **Tracking Magic** | High (Components don't always fully re-render) | Low (Components re-render based on atom changes) |
| **Compatibility** | Requires special React integration / Babel plugins | Pure React hooks, no special tools needed |

---

## Syntax Comparison

### Signals (Preact style in React)

Uses `signal()` and the signal value directly in JSX (which often bypasses the standard React re-render cycle for that component).

```tsx
import { signal } from "@preact/signals-react"

const count = signal(0)

const Counter = () => {
  // Accessing count.value inside JSX automatically subscribes this component
  return <button onClick={() => count.value++}>{count}</button>
}
```

### NirdJS

Uses the standard `useValue()` hook which is fully compatible with React's rendering model.

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

## Why choose NirdJS over Signals?

1.  **Pure React Experience**: Signals often work by "bypassing" React's standard rendering cycle to gain performance. This can sometimes lead to unexpected behavior with other React features like Suspense, Transitions, or certain third-party libraries. NirdJS is a a predictable React-first library.
2.  **No Tooling required**: Many signal implementations require Babel plugins or special configurations to work correctly in React. NirdJS works out of the box with any standard React setup.
3.  **Traceability**: NirdJS uses functional updates (`prev => next`) which makes it very clear how a state change happened. Signals often encourage direct mutation (`count.value++`) which can be harder to track through a large codebase.
4.  **Standard Hooks**: NirdJS uses standard React hooks (`useEffect`, `useState` under the hood in `useValue`), making it very easy for any React developer to understand.

## When to choose Signals?

*   If you have extremely high-frequency updates (e.g., a data-heavy dashboard with hundreds of updates per second) where bypassing the React render cycle is a performance necessity.
*   If you are already using a signal-based framework like SolidJS or Preact.

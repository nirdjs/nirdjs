# Redux Toolkit vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

**Redux Toolkit (RTK)** is a comprehensive framework for managing state in large applications. It enforces a strict "One-Way Data Flow" with actions, reducers, and a single global store.

**NirdJS** is a lightweight, atomic state library. It prioritizes zero-boilerplate updates and individual state slices (atoms) that live outside the React component tree.

---

## Code Comparison: A Simple Counter

### Redux Toolkit

You need a "slice" with initial state and reducer logic, then you need to provide the store to your app.

```ts
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1 },
  },
});

export const { increment } = counterSlice.actions;
const store = configureStore({ reducer: counterSlice.reducer });
```

In the component:
```tsx
const count = useSelector(state => state.counter.value);
const dispatch = useDispatch();
<button onClick={() => dispatch(increment())}>{count}</button>
```

### NirdJS

You define an atom and an update function. No slice, no reducer, no dispatch.

```ts
import { atom } from 'nirdjs';

export const counterAtom = atom(0);
export const increment = () => counterAtom.update(n => n + 1);
```

In the component:
```tsx
const count = useValue(counterAtom);
<button onClick={increment}>{count}</button>
```

---

## Why choose NirdJS over Redux?

1.  **Zero Boilerplate**: No need to define actions or reducers for simple state updates.
2.  **Flexible Access**: Access and update state from anywhere (WebSockets, timers) without needing a `dispatch` reference.
3.  **Performance**: Only components subscribed to a specific atom re-render. In Redux, any state change can trigger selectors across the whole app if not carefully optimized.
4.  **Stable References**: `increment` above is a plain function that never changes identity, unlike a dispatched action.

## When to stick with Redux?

*   If your team is already deeply invested in the Redux ecosystem.
*   If you need advanced features like the Redux DevTools Time Travel or complex middleware (though NirdJS simplicity often removes the need for middleware).

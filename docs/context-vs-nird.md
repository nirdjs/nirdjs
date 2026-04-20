# React Context API vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

The **Context API** is a built-in feature of React designed for passing data down a component tree without manually drilling props. It is **not** a state management library by itself, but is often used as one.

**NirdJS** is a specialized state management library that happens to solve the same problem (avoiding prop drilling) while offering professional-grade performance and ergonomics.

---

## Key Differences

| Feature | Context API | NirdJS |
| :--- | :--- | :--- |
| **Re-render Granularity** | Low (All consumers re-render on any change) | High (Only subscribers to a specific atom re-render) |
| **Logic Location** | Must live inside a "Provider" component | Lives in plain JS atoms outside components |
| **Performance** | Tricky (Requires manual `useMemo` and complex context splitting) | "Automatic" (Subscribers only get updates for their atom) |
| **SSR Setup** | Standard tree-based | Uses Node's `AsyncLocalStorage` for performance |

---

## Syntax Comparison

### Context API

Requires a Provider, a custom hook for the context, and careful use of `useMemo` to prevent unnecessary re-renders.

```tsx
const UserContext = React.createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Manual memoization to prevent rendering children unnecessarily
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

const UserProfile = () => {
  const { user } = useContext(UserContext);
  return <div>{user.name}</div>;
}
```

### NirdJS

Plain atom, straightforward hook.

```ts
import { atom } from 'nirdjs';
const userAtom = atom(null);

const UserProfile = () => {
  const user = useValue(userAtom);
  return <div>{user.name}</div>;
}
```

---

## Why choose NirdJS over Context?

1.  **Performance Without Pain**: Context re-renders **every component** that uses `useContext(MyContext)` whenever **any part** of that context's value changes. You then have to "split contexts" or use complex memoization to fix it. NirdJS atoms are granular by design—only the component using that specific atom re-renders.
2.  **No Logic in Components**: In NirdJS, you don't need to wrap your app in a hundred `<Provider>` components to manage different slices of state.
3.  **Outside React**: Context is only available inside React components. NirdJS atoms are available everywhere.

## When to stick with Context?

*   For very small bits of global info that rarely change (e.g., "Current Theme" or "Language").
*   If you're building a library and don't want to force a dependency on your users.

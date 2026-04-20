# TanStack Query (React Query) vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

**TanStack Query (React Query)** is a "server state" management library. It's designed to handle data fetching, caching, synchronization, and updating server data. 

**NirdJS** is a "client state" management library. It's designed to handle UI state, local preferences, and complex inter-component states that don't live on a server.

---

## Key Differences

| Feature | TanStack Query | NirdJS |
| :--- | :--- | :--- |
| **Primary Goal** | Syncing with a Server / Caching | Managing local UI state |
| **Ownership** | Usually a remote Database | The browser / local app runtime |
| **Complexity** | High (Caching, Retry, Poll, Prefetch) | Low (Atoms, Updates, Subscriptions) |
| **Integration** | Wraps async logic | Standard state management |

---

## Do you need both?

**Yes.** In a professional React app, you often use both together.

### The ideal workflow:

1.  **TanStack Query**: For your product list, your user profile data, and your API calls.
2.  **NirdJS**: For your "Is the sidebar expanded?" state, "What's in the current shopping cart?" (before it's saved), and "User UI theme preference".

---

## Comparison Example

### TanStack Query (Server State)

```tsx
const { data, isLoading } = useQuery(['user'], fetchUser);
if (isLoading) return <Loading />;
return <div>{data.name}</div>;
```

### NirdJS (Client State)

```ts
const isModalOpenAtom = atom(false);
const toggleModal = () => isModalOpenAtom.update(v => !v);

const ModalToggle = () => {
  const isOpen = useValue(isModalOpenAtom);
  return <button onClick={toggleModal}>{isOpen ? 'Close' : 'Open'}</button>;
}
```

---

## Why choose NirdJS for client state?

While some people try to store *everything* in TanStack Query (using "placeholder data" for UI state), it's not what the library is designed for. 

1.  **Performance**: NirdJS is much more efficient for high-frequency UI updates (e.g., tracking mouse position, keyboard input, or a canvas state).
2.  **No "Network" Overhead**: NirdJS atoms have zero overhead and are purely synchronous for local state updates.
3.  **Simplicity**: Storing simple boolean flags in a `useQuery` cache is overkill.

## Common pattern:

A professional app uses **TanStack Query** to fetch "User Settings" from a DB, and uses **NirdJS** to provide a "Settings Preview" state where the user can play with their dashboard theme before hitting "Save".

# nirdjs

Atomic state management for React — tiny, fast, SSR-ready.

[![npm](https://img.shields.io/npm/v/nirdjs.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/nirdjs)
[![bundle](https://img.shields.io/bundlephobia/minzip/nirdjs?style=flat-square&label=bundle)](https://bundlephobia.com/package/nirdjs)
[![license](https://img.shields.io/npm/l/nirdjs.svg?style=flat-square)](https://github.com/nirdjs/nirdjs/blob/main/LICENSE)

```sh
npm install nirdjs
```

## TODO App Example

A complete TODO app in three files.

### `todoState.ts` — state lives outside React

```ts
import { atom, derive, splitAtom, useValue, NeverSet } from 'nirdjs';

// types
type Todo = { text: string; done: boolean };

// atoms
const todosAtom = atom<Todo[]>([]);
const todoAtomsAtom = splitAtom(todosAtom);
const remainingAtom = derive(
  todosAtom,
  todos => todos.filter(t => !t.done).length,
  NeverSet,
);

// actions — plain functions, call from anywhere
export const addTodo = (text: string) =>
  todosAtom.update(prev => [...prev, { text, done: false }]);

export const toggleTodo = (i: number) =>
  todosAtom.update(prev =>
    prev.map((t, j) => (j === i ? { ...t, done: !t.done } : t)),
  );

export const clearDone = () =>
  todosAtom.update(prev => prev.filter(t => !t.done));

export const resetTodos = () => todosAtom.reset();

// hooks
export const useTodoAtoms = () => useValue(todoAtomsAtom);
export const useRemaining = () => useValue(remainingAtom);
```

### `TodoItem.tsx` — each item has its own atom

```tsx
import { useValue, type Atom } from 'nirdjs';
import { toggleTodo } from './todoState';

export const TodoItem = ({ atom, index }: { atom: Atom<Todo>; index: number }) => {
  const todo = useValue(atom);

  return (
    <li
      onClick={() => toggleTodo(index)}
      style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
    >
      {todo.text}
    </li>
  );
};
```

### `App.tsx` — compose it

```tsx
import { useTodoAtoms, useRemaining, addTodo, clearDone, resetTodos } from './todoState';
import { TodoItem } from './TodoItem';

export const App = () => {
  const todoAtoms = useTodoAtoms();
  const remaining = useRemaining();

  return (
    <div>
      <h1>Todos ({remaining} left)</h1>

      <form onSubmit={e => {
        e.preventDefault();
        const input = e.currentTarget.elements[0] as HTMLInputElement;
        addTodo(input.value);
        input.value = '';
      }}>
        <input placeholder="What needs to be done?" />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todoAtoms.map((atom, i) => (
          <TodoItem key={i} atom={atom} index={i} />
        ))}
      </ul>

      <button onClick={clearDone}>Clear done</button>
      <button onClick={resetTodos}>Reset all</button>
    </div>
  );
};
```

**What's happening:**

- `todosAtom` holds the array. `splitAtom` breaks it into per-item atoms so changing one todo doesn't re-render the list.
- `remainingAtom` is a read-only derived atom — it recomputes automatically when `todosAtom` changes.
- `addTodo`, `toggleTodo`, `clearDone`, `resetTodos` are plain functions. No dispatch, no action types.
- `useValue` subscribes a component. That's the only hook.

---

## API

### Atoms

```ts
const a = atom(initialValue, config?)

a.get()            // current value
a.set(value)       // set new value, notify subscribers
a.update(fn)       // set from previous: fn(prev) => next
a.reset()          // restore to initialValue
a.sub(fn)          // subscribe: fn(next, prev)
a.unsub(fn)        // unsubscribe
```

Config: `{ debugLabel?, ignoreWhen?, allowFnValue? }`

### React Hook

```ts
const value = useValue(atom)  // subscribe component to atom
```

### Derived Atoms

```ts
// read-only
const derived = derive(source, val => transform(val), NeverSet)

// read-write
const derived = derive(source, val => toB(val), (bVal, aVal) => toA(bVal))

// single property
const nameAtom = propertyAtom(userAtom, 'name')
```

### Arrays

```ts
const itemAtoms = splitAtom(arrayAtom)     // array atom → atom per element
updateElt(arrayAtom, index, fn)            // update one element
```

### Batching

```ts
await batch(() => {
  a.set(1)
  b.set(2)
})
// subscribers notified once, deduplicated per atom
```

### Helpers

```ts
const getVal = atomGetter(atom)   // () => Value
const setVal = atomSetter(atom)   // (value) => void
```

### SSR

```ts
import { disableDefaultStore, setStoreProvider, createAtomStore } from 'nirdjs';
import { asyncLocalStorageStoreProvider, execWithAtom } from 'nirdjs/ssr/AsyncLocalStorageAtomProvider';

disableDefaultStore();
setStoreProvider(asyncLocalStorageStoreProvider);

// each request gets its own store
const html = execWithAtom(createAtomStore(), () => renderToString(<App />));
```

---

## License

[Apache-2.0](./LICENSE)

## Links

- [GitHub](https://github.com/nirdjs/nirdjs)
- [npm](https://www.npmjs.com/package/nirdjs)

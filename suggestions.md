# NirdJS — Bug Suggestions

## Bug 1 — `useValue`: missing dependency array in `useEffect`

**File:** `src/useValue.ts`

`useEffect` is called without a dependency array, so it runs after **every render**.
This means the hook unsubscribes and re-subscribes on every render, opening a window
where atom updates can be silently missed (a race condition / tearing bug).

```ts
// ❌ Current — re-subscribes on every render
useEffect(() => {
  const subscriber = (nextValue: Value) => setValue(nextValue);
  atom.sub(subscriber);
  return () => atom.unsub(subscriber);
}); // ← no dependency array
```

```ts
// ✅ Fix — only re-subscribe when the atom reference changes
useEffect(() => {
  const subscriber = (nextValue: Value) => setValue(nextValue);
  atom.sub(subscriber);
  return () => atom.unsub(subscriber);
}, [atom]); // ← add [atom]
```

> Also consider replacing `useState + useEffect` with React 18's `useSyncExternalStore`,
> which is the React-team-recommended API for external stores and prevents tearing under
> concurrent rendering.

---

## Bug 2 — `useNano`: same missing dependency array

**File:** `src/nanoState.ts`

`useNano` has the identical problem as `useValue` above.

```ts
// ❌ Current
useEffect(() => {
  n.sub(setValue);
  return () => { n.unsub(setValue); };
}); // ← no dependency array
```

```ts
// ✅ Fix
useEffect(() => {
  n.sub(setValue);
  return () => { n.unsub(setValue); };
}, [n]); // ← add [n]
```

---

## Bug 3 — `derive.set()` notifies subscribers twice

**File:** `src/derive.ts`

When you call `.set()` on a derived atom, `innerAtom.set(nextValue)` is called directly,
which fires subscribers once. Then `sourceAtom.set(nextSourceValue)` triggers the `sourceAtom`
subscription, which runs `innerAtom.set(deriveFromSource(nextSourceValue))` again — a second
notification for the same logical update.

```ts
// ❌ Current — double notification
set(nextValue: DerivedValue) {
  const nextSourceValue = propagateToSource(nextValue, sourceAtom.get());
  innerAtom.set(nextValue);        // ← fires subscribers (1st time)
  sourceAtom.set(nextSourceValue); // ← triggers subscription → innerAtom.set again (2nd time)
}
```

```ts
// ✅ Fix — only update the source; let the subscription handle innerAtom
set(nextValue: DerivedValue) {
  const nextSourceValue = propagateToSource(nextValue, sourceAtom.get());
  sourceAtom.set(nextSourceValue); // subscription will update innerAtom automatically
}
```

---

## Bug 4 — `splitAtom`: atom list goes stale when array length changes

**File:** `src/arrays.ts`

`splitAtom` builds its array of atoms once at construction time from a snapshot of the
source array. If the source array later grows or shrinks, the split atom's list never
updates to match.

```ts
// ❌ Current — arrayOfAtoms is built once and never resized
const valueArray = source.get(); // snapshot at creation time
const atomOfArrayToArrayOfAtoms = () => {
  for (let index = 0; index < valueArray.length; index++) { // ← uses stale length
    arrayOfAtoms.push(derived);
  }
  return arrayOfAtoms;
};
```

The `atomOfArrayToArrayOfAtoms` callback closes over the initial `valueArray` length and
also mutates `arrayOfAtoms` by pushing on every call, which means calling it more than
once produces duplicate atoms.

**Fix:** Recompute the atom list from the live `nextSourceValue` inside the derive callback,
using a stable identity map (e.g. `Map<index, Atom>`) to avoid recreating atoms that already exist.

---

## Bug 5 — `batch`: type mismatch and non-composable

**File:** `src/atom.ts`

The `fn` parameter is typed as `() => void` but the function is `await`-ed, which only
makes sense if `fn` can return a `Promise`. The signature should be explicit:

```ts
// ❌ Current — misleading type
export const batch = async (fn: () => void): Promise<void> => { ... }
```

```ts
// ✅ Fix
export const batch = async (fn: () => void | Promise<void>): Promise<void> => { ... }
```

Additionally, `batch` throws `"Another batching is already in the progress"` if called
while another batch is running. This means you cannot call a batched function from inside
another batched callback. Consider queuing or composing nested batches instead of throwing.

---

## Bug 6 — `unsub` error message says "Couldn't add"

**File:** `src/atom.ts`

Copy-paste error: the `unsub` method throws an error that says "Couldn't **add** atom sub"
when it should say "Couldn't **remove** atom sub".

```ts
// ❌ Current
unsub(subscriber: Subscriber<Value>) {
  if (!subscriber || typeof subscriber !== "function") {
    throw new Error(`Couldn't add atom sub: ${subscriber}`); // ← wrong verb
  }
  subscribers.delete(subscriber);
}
```

```ts
// ✅ Fix
throw new Error(`Couldn't remove atom sub: ${subscriber}`);
```

---

## Bug 7 — `allowFnValue` guard silently swallows errors

**File:** `src/atom.ts`

When `allowFnValue` is `false` (the default) and a function is passed to `atom.set()`,
the call silently returns after logging a `console.trace`. This means the update is
**dropped with no indication to the caller**.

```ts
// ❌ Current — silent failure
set(nextValue: Value) {
  if (!config.allowFnValue && typeof nextValue === "function") {
    console.trace("atom set fn", config.debugLabel, nextValue);
    return; // ← caller has no idea the update was dropped
  }
  ...
}
```

Since TypeScript's type system already prevents `atom<number>.set(fn)` for typed atoms,
this guard is only relevant for untyped / `any` usage. It should `throw` rather than
silently swallow, or be removed entirely in favour of relying on TypeScript.

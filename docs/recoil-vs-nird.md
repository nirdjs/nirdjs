# Recoil vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

**Recoil** is a powerful state management library created by Facebook. It introduced the atoms and selectors model to solve the "context-hell" problem in React. However, it's also a large and complex dependency.

**NirdJS** is a "spiritual successor" to Recoil's atoms and selectors. It takes the best parts of the atomic philosophy and distills them into a tiny, auditable core.

---

## Key Differences

| Feature | Recoil | NirdJS |
| :--- | :--- | :--- |
| **Complexity** | High (Snapshots, Atom Families, Selectors) | Low (Atoms, `derive`, `propertyAtom`) |
| **Dependency Weight** | ~20 KB (compressed) | ~1 KB |
| **Mental Model** | Complex Graph of State Transitions | Simple Atoms and Data Transformations |
| **DevTools** | Robust Snapshot Tracking | Simple Debug Labels |

---

## Syntax Comparison

### Recoil

Requires a `<RecoilRoot>` wrap and unique keys for every atom.

```ts
import { atom, selector, useRecoilValue } from 'recoil';

const textState = atom({
  key: 'textState', // unique ID required
  default: '',
});

const charCountState = selector({
  key: 'charCountState',
  get: ({get}) => get(textState).length,
});
```

### NirdJS

No unique keys (uses reference identity), no `<Provider>` required in the browser.

```ts
import { atom, derive, NeverSet } from 'nirdjs';

const textAtom = atom('');
const charCountAtom = derive(textAtom, s => s.length, NeverSet);
```

---

## Why choose NirdJS over Recoil?

1.  **Lightweight**: NirdJS is 1/20th the size of Recoil.
2.  **No Boilerplate IDs**: NirdJS uses JS object references as atom identifiers, so you don't need to manually manage string keys like `key: 'userState'`.
3.  **Modern SSR**: Recoil's SSR setup is complex; NirdJS's `AsyncLocalStorage` is much simpler for modern server environments.
4.  **Auditability**: You can read the entire NirdJS source code in 10 minutes.

## When to choose Recoil?

*   If you need advanced features like "Atom Families" (though `splitAtom` in NirdJS solves the array equivalent).
*   If you need "Snapshots" for complex global state serialization.

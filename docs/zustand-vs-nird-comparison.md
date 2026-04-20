# NirdJS vs Other State Management Libraries

← Back to [pitch.md](./pitch.md)

---

## Mental Model Comparison

| Library   | Mental model                           | NirdJS equivalent                                            |
|-----------|----------------------------------------|--------------------------------------------------------------|
| **Redux** | One big tree, actions, reducers        | Many small atoms, direct `set()` / `update()`                |
| **Zustand** | One store object, selector functions | Same atoms, `atomGetter` / `atomSetter` helpers             |
| **Jotai** | Atoms in React context                 | Atoms live outside React entirely; SSR via `AsyncLocalStorage` |
| **Recoil** | Atoms + selectors                     | Atoms + `derive()`                                           |
| **MobX**  | Mutable observable objects             | Immutable atoms with functional updates                      |
| **useState** | Local component state               | Global atoms, shared across components without prop drilling |

---

## Feature Comparison

| Feature                          | NirdJS | Zustand | Jotai | Redux Toolkit |
|----------------------------------|:------:|:-------:|:-----:|:-------------:|
| No Provider required (browser)   | ✅      | ✅       | ❌     | ❌             |
| SSR-safe                         | ✅      | ⚠️ manual | ✅   | ✅             |
| Fine-grained atom subscriptions  | ✅      | ⚠️ manual | ✅   | ⚠️ manual      |
| Derived / computed state         | ✅      | ⚠️ manual | ✅   | ✅ (RTK)       |
| Actions outside React            | ✅      | ✅       | ⚠️    | ✅             |
| Batched updates                  | ✅      | ✅       | ✅    | ✅             |
| Array split atoms                | ✅      | ❌       | ✅    | ❌             |
| TypeScript first                 | ✅      | ✅       | ✅    | ✅             |
| Bundle size (approx)             | ~1 KB  | ~1.5 KB | ~3 KB | ~15 KB        |
| DevTools                         | ❌      | ✅       | ✅    | ✅             |

> ⚠️ = possible but requires extra boilerplate or manual wiring

---

### Detailed Comparisons
- [Redux Toolkit vs Nird](./redux-vs-nird.md)
- [Zustand vs Nird](./zustand-vs-nird.md)
- [Jotai vs Nird](./jotai-vs-nird.md)
- [Recoil vs Nird](./recoil-vs-nird.md)
- [MobX vs Nird](./mobx-vs-nird.md)
- [Context API vs Nird](./context-vs-nird.md)
- [Valtio vs Nird](./valtio-vs-nird.md)
- [XState vs Nird](./xstate-vs-nird.md)
- [TanStack Query vs Nird](./query-vs-nird.md)
- [Signals vs Nird](./signals-vs-nird.md)

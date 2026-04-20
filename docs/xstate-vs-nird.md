# XState vs NirdJS

← Back to [pitch.md](./pitch.md) | [Comparison table](./zustand-vs-nird-comparison.md)

---

## The Philosophy

**XState** is a "state machine and statechart" library for JavaScript. It's designed to model **logic** first. It forces you to think about every possible state and transition in your app to eliminate "impossible states".

**NirdJS** is a "data-first" atomic state library. It's designed to manage **data** effectively and let React handle the transitions.

---

## Key Differences

| Feature | XState | NirdJS |
| :--- | :--- | :--- |
| **Model Type** | Finite State Machine (Logic-first) | Atomic State (Data-first) |
| **Formality** | High (States, Events, Transitions) | Low (Atoms, Updates) |
| **Learning Curve** | Steep (Statecharts, actions, actors) | Shallow (Atoms, Hooks) |
| **Visualization** | Visual Editor available | No special editor needed |

---

## Syntax Comparison

### XState

Define a machine with states and events.

```ts
import { createMachine, interpret } from 'xstate';

const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: { on: { TOGGLE: 'inactive' } }
  }
});
```

### NirdJS

Define an atom and a simple update function.

```ts
import { atom } from 'nirdjs';

const isActiveAtom = atom(false);
const toggle = () => isActiveAtom.update(prev => !prev);
```

---

## Why choose NirdJS over XState?

1.  **Simplicity**: XState is incredibly powerful but has a very steep learning curve. If your state logic is straightforward ("toggle this modal", "store this list"), NirdJS is much faster to implement and understand.
2.  **No "Formal" Ceremony**: You don't need to define explicit "states" for everything. You can just use boolean atoms or enum atoms and update them as needed.
3.  **Lightweight**: XState is a heavy dependency. NirdJS is ~1 KB and does exactly one job: managing state.
4.  **Integration**: NirdJS feels like "standard" React state (`useState`) but global. It doesn't require learning the actor model or statechart theory.

## When to choose XState?

*   If your application logic is extremely complex (e.g., a multi-step financial wizard with "undo", "retry", and "partial success" states).
*   If you need to model complex, interdependent side effects formally.

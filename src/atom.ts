import { getStore } from "./store";

export type Subscriber<Value> = (nextValue: Value, prevValue: Value) => void;

let atomCounter = 0;

/**
 * Updater function. Gets the previous value and returns the next value.
 * @see {@link Atom.update}
 */
export type UpdateFn<Value> = (prev: Value) => Value;

/**
 * Callback function to skip notification of subscriber when @see {@link Atom} value has not actually changed.
 * Should return `true` to skip notification, just as `===`.
 *
 * @see {@link Atom.update}
 * @see {@link Atom.sub}
 */
export type IgnoreWhenFn<Value> = (
  prevValue: Value,
  nextValue: Value,
) => boolean;



/**
 * The configuration of a atom.
 */
export type AtomConfig<Value> = {
  /**
   * when previous and next value of the atom are the same, then
   * atom will not notify subscriber about the change.
   * This way you can avoid unnecessary recalculations and re-render of the UI.
   *
   * defaults to @see {@link isIdentical}.
   * For better performance, when your state is not weird, provide a deepEquals implementation.
   */
  ignoreWhen?: IgnoreWhenFn<Value>;
  /**
   * Debug label of this atom
   */
  debugLabel?: string;
  /**
   * Allow setting a function as a value (e.g., `atom.set(myFn)`).
   * By default, passing a function to `set()` throws to prevent
   * accidental `atom.set(updater)` instead of `atom.update(updater)`.
   * @default false
   */
  allowFnValue?: boolean;
};

/**
 * a === b || (Number.isNaN(a) && Number.isNaN(b))
 *
 * @param a
 * @param b
 * @returns true if and only if two values are identical
 */
export const isIdentical = <Value>(a: Value, b: Value): boolean =>
  a === b || (Number.isNaN(a) && Number.isNaN(b));

/**
 * Can be used as @see {@link AtomConfig.ignoreWhen} value.
 * Will cause atom to always notify subscriber even when the value has not changed.
 */
export const neverIgnore = undefined;

/**
 * Used when no @see {@link atom()} config is provided
 */
export const defaultConfig = {
  /**
   * @see {@link isIdentical}
   */
  ignoreWhen: isIdentical,

  /** using "atom" as default */
  debugLabel: "atom",
  /**
   * helps debugging situations when you `atom.set(fn)` by mistake
   * @default false
   */
  allowFnValue: false,
};

const getStoreAtomValue = <Value>(atom: Atom<Value>): Value => {
  return getStore().atom2value.get(atom.id()) as Value;
};

const setStoreAtomValue = <Value>(atom: Atom<Value>, value: Value) => {
  return getStore().atom2value.set(atom.id(), value);
};

/**
 * Atom type. Hold a specific value in a @see {@link Store}
 */
export type Atom<Value> = {
  /**
   * returns number id of the atom. Doesn't change.
   */
  id: () => number;
  /**
   *
   * @returns current value of the atom in the Store
   */
  get: () => Value;
  /**
   * Set new current value of the atom in the Store
   * @param value
   * @returns
   */
  set: (value: Value) => void;
  /**
   * Perform update function to the result of get() and then set().
   * @param updateFn
   * @returns
   */
  update: (updateFn: UpdateFn<Value>) => void;
  /**
   * Add new subscriber to this atom
   * @param subscriber
   * @returns
   */
  sub: (subscriber: Subscriber<Value>) => void;
  /**
   * Remove this subscriber from the atom
   * @param subscriber
   * @returns
   */
  unsub: (subscriber: Subscriber<Value>) => void;
  /**
   * @returns number of current subscribers
   * @internal
   */
  subCount: () => number;
  /**
   * Reset the atom to its initial value.
   */
  reset: () => void;
  /**
   * return unique string representation of this atom and it's state
   */
  toString: () => string;
};
/**
 * Create new atom .
 * @param initialValue the value this atom gets initialy or resets to. Should be of type Value.
 * @param atomConfig optional
 * @returns new Atom.
 */
export const atom = <Value>(
  initialValue: Value,
  atomConfig?: AtomConfig<Value>,
): Atom<Value> => {
  // let currentValue: Value = initialValue;
  const subscribers = new Set<Subscriber<Value>>();
  const atomId = atomCounter++;

  const config = atomConfig
    ? { ...defaultConfig, ...atomConfig }
    : defaultConfig;

  const notifyNow = (nextValue: Value, prevValue: Value) => {
    for (const subscriber of subscribers) {
      subscriber(nextValue, prevValue);
    }
  };
  const notify = (nextValue: Value, prevValue: Value) => {
    if (config?.ignoreWhen?.(nextValue, prevValue)) {
      return;
    }

    const store = getStore();
    if (store.batching === undefined) {
      notifyNow(nextValue, prevValue);
      return;
    }

    store.batching.set(atomId, () => {
      notifyNow(nextValue, prevValue);
    });
  };

  const atom: Atom<Value> = {
    id() {
      return atomId;
    },
    get(): Value {
      return getStoreAtomValue<Value>(this);
    },
    set(nextValue: Value) {
      if (!config.allowFnValue && typeof nextValue === "function") {
        throw new Error(
          `atom.set(fn) is not allowed by default. Use atom(value, { allowFnValue: true }) or pass a non-function value. Provided: ${nextValue}`,
        );
      }
      const prevValue = this.get();
      setStoreAtomValue(this, nextValue);
      notify(nextValue, prevValue);
    },
    update(setterFn: UpdateFn<Value>) {
      const prevValue = this.get();
      const nextValue = setterFn(prevValue);
      this.set(nextValue);
    },
    sub(subscriber: Subscriber<Value>) {
      if (!subscriber || typeof subscriber !== "function") {
        throw new Error(`Couldn't add atom sub: ${subscriber}`);
      }
      subscribers.add(subscriber);
    },
    unsub(subscriber: Subscriber<Value>) {
      if (!subscriber || typeof subscriber !== "function") {
        throw new Error(`Couldn't remove atom sub: ${subscriber}`);
      }
      subscribers.delete(subscriber);
    },
    subCount() {
      return subscribers.size;
    },
    reset() {
      this.set(initialValue);
    },
    toString() {
      return `${config.debugLabel}:${atomId}: [${this.get()}]`;
    },
  };

  // Seed initial value directly without triggering notify
  setStoreAtomValue(atom, initialValue);

  return atom;
};

/**
 * Performs atom transaction (batching). Internally:
 * 1) starts postponing all atom notifications
 * 2) calls await @param fn()
 * 3) performs all postponed notifications (deduplicated per atom)
 */
export const batch = async (
  fn: () => void | Promise<void>,
): Promise<void> => {
  const store = getStore();
  try {
    if (store.batching === undefined) {
      store.batching = new Map();
    }
    store.batchDepth++;
    await fn();
  } finally {
    store.batchDepth--;
    if (store.batchDepth === 0 && store.batching) {
      const notifications = store.batching;
      store.batching = undefined;
      for (const notification of notifications.values()) {
        notification();
      }
    }
  }
};

import {
  createElement,
  Fragment,
  type FunctionComponentElement,
  type ReactNode,
} from "react";
import { createAtomStore, type AtomStore } from "../store";

import { AsyncLocalStorage } from "node:async_hooks";
import type { NoAttributesType } from "../langUtils";

const asyncLocalStorage = AsyncLocalStorage
  ? new AsyncLocalStorage<AtomStore>()
  : (undefined as unknown as AsyncLocalStorage<AtomStore>);

export const asyncLocalStorageStoreProvider = (): AtomStore => {
  const store = asyncLocalStorage?.getStore();
  return store as AtomStore;
};

export const execWithAtom = <R>(store: AtomStore, fn: () => R) => {
  return asyncLocalStorage.run(store, fn);
};

export const AsyncLocalStorageAtomProvider = ({
  children,
  store,
}: {
  children?: ReactNode;
  store?: AtomStore;
}): FunctionComponentElement<NoAttributesType> => {
  const theStore = store || createAtomStore();
  return execWithAtom(theStore, () => {
    return createElement(Fragment, {}, children);
  });
};

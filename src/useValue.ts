import { useSyncExternalStore } from "react";
import type { Atom } from "./atom";

/**
 * The usual React hook to get atom value and subscribes the caller Component.
 * Use it only in React functional components or other react hooks.
 * You are very welcome to create new React hooks using it.
 *
 * @param atom
 * @returns current value of the @param atom, on every render
 */
export const useValue = <Value>(atom: Atom<Value>): Value => {
  return useSyncExternalStore(
    (onStoreChange) => {
      atom.sub(onStoreChange);
      return () => atom.unsub(onStoreChange);
    },
    () => atom.get(),
    () => atom.get(), // Server snapshot
  );
};

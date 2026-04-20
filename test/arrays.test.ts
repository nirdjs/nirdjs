import { expect, mock, test } from "bun:test";
import { atom, type Atom } from "../src/atom";
import { arrayEltAtom, splitAtom } from "../src/arrays";

test("arrayEltAtom — should derive a single element by index", () => {
  const source = atom([10, 20, 30]);
  const elt1 = arrayEltAtom(source, 1);
  
  expect(elt1.get()).toBe(20);
  
  elt1.set(200);
  expect(source.get()).toEqual([10, 200, 30]);
});

test("splitAtom — should preserve existing atoms when single value changes", () => {
  const arrayAtom = atom([10, 20]);
  const splitArrayAtom = splitAtom(arrayAtom);

  const atom0: Atom<number> = splitArrayAtom.get()[0];
  const atom1: Atom<number> = splitArrayAtom.get()[1];

  const subListMask = mock(() => {});
  const sub0 = mock(() => {});
  const sub1 = mock(() => {});

  splitArrayAtom.sub(subListMask);
  atom0.sub(sub0);
  atom1.sub(sub1);

  atom0.set(0);

  expect(sub0).toHaveBeenCalledTimes(1);
  expect(sub1).toHaveBeenCalledTimes(0);

  // The list atom itself should NOT notify because the array of atoms is identical (stable)
  expect(subListMask).toHaveBeenCalledTimes(0);
});

test("splitAtom — should handle array length changes correctly", () => {
  const source = atom([1, 2]);
  const split = splitAtom(source);
  expect(split.get().length).toBe(2);

  const subscriber = mock(() => {});
  split.sub(subscriber);

  // Add an item to source
  source.set([1, 2, 3]);
  expect(split.get().length).toBe(3);
  expect(subscriber).toHaveBeenCalledTimes(1);

  // Remove items
  source.set([1]);
  expect(split.get().length).toBe(1);
  expect(subscriber).toHaveBeenCalledTimes(2);
});

test("splitAtom — should maintain stability and not notify if content hasn't logically changed", () => {
  const source = atom([1, 2]);
  const split = splitAtom(source);
  const subscriber = mock(() => {});
  split.sub(subscriber);

  // Update a value directly in the source
  source.set([1, 2]); // same content

  // Should NOT notify because atoms were stable and content is identical
  expect(subscriber).toHaveBeenCalledTimes(0);
});

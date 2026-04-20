import { expect, mock, test } from "bun:test";
import { splitAtom } from "../src/arrays";
import { atom, type Atom } from "../src/atom";

test("atomList does not change when single value changes", () => {
  const arrayAtom = atom([10, 20]);
  const splitArrayAtom = splitAtom(arrayAtom);

  const atom0: Atom<number> = splitArrayAtom.get()[0];
  const atom1: Atom<number> = splitArrayAtom.get()[1];

  const nopFn = () => {};
  const subAtomMock = mock(nopFn);
  const sub0 = mock(nopFn);
  const sub1 = mock(nopFn);

  /// test

  splitArrayAtom.sub(subAtomMock);
  atom0.sub(sub0);
  atom1.sub(sub1);

  atom0.set(0);

  expect(sub0).toHaveBeenCalledTimes(1);

  expect(sub1).toHaveBeenCalledTimes(0);

  expect(subAtomMock).toHaveBeenCalledTimes(0);
});

test("splitAtom handles array length changes correctly", () => {
  const source = atom([1, 2]);
  const split = splitAtom(source);
  expect(split.get().length).toBe(2);

  // Add an item to source
  source.set([1, 2, 3]);
  expect(split.get().length).toBe(3);

  // Remove items
  source.set([1]);
  expect(split.get().length).toBe(1);
});

test("splitAtom stability: should not notify if list content hasn't changed", () => {
  const source = atom([1, 2]);
  const split = splitAtom(source);
  const subscriber = mock(() => {});
  split.sub(subscriber);

  // Update a value via one of the child atoms
  const child0 = split.get()[0];
  child0.set(100);

  // The source atom should be updated
  expect(source.get()[0]).toBe(100);
  // The split atom itself should NOT have notified because the array of atoms is identical
  expect(subscriber).toHaveBeenCalledTimes(0);
});

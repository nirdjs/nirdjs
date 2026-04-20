import { expect, mock, test } from "bun:test";
import { atom, batch } from "../src/atom";
import { derive } from "../src/derive";

test("Bug 3 Fix — derive.set() should notify subscribers exactly once", () => {
  const sourceAtom = atom<number>(1);
  
  // A writable derived atom that returns a new object every time
  const derivedAtom = derive<number, { value: number }>(
    sourceAtom,
    (val) => ({ value: val }),
    (next) => next.value
  );

  const subscriber = mock(() => {});
  derivedAtom.sub(subscriber);

  // Initial state check
  expect(derivedAtom.get().value).toBe(1);
  expect(subscriber).toHaveBeenCalledTimes(0);

  // Update via derived atom
  derivedAtom.set({ value: 2 });

  expect(derivedAtom.get().value).toBe(2);
  expect(sourceAtom.get()).toBe(2);

  // Verification: should be exactly 1 call
  expect(subscriber).toHaveBeenCalledTimes(1);
});

test("derive.set() — consistency and canonicality", () => {
  const sourceAtom = atom<number>(10);
  
  // A derived atom that represents a percentage (0-1)
  const percentAtom = derive<number, number>(
    sourceAtom,
    (val) => val / 100,
    (percent) => percent * 100
  );

  expect(percentAtom.get()).toBe(0.1);

  percentAtom.set(0.5);
  expect(sourceAtom.get()).toBe(50);
  expect(percentAtom.get()).toBe(0.5);
});

test("derive.set() — behavior within a batch()", async () => {
  const sourceAtom = atom<number>(1);
  const derivedAtom = derive<number, { v: number }>(
    sourceAtom,
    (val) => ({ v: val }),
    (next) => next.v
  );

  const subscriber = mock(() => {});
  derivedAtom.sub(subscriber);

  await batch(async () => {
    derivedAtom.set({ v: 2 });
    derivedAtom.set({ v: 3 });
    expect(subscriber).toHaveBeenCalledTimes(0); // Should be deferred
  });

  // After batch, it should have been called twice (once for each .set() call).
  // This is because nirdjs batching queues every notification task.
  // Note: Before the Bug 3 fix, this would have been 4 calls!
  expect(subscriber).toHaveBeenCalledTimes(2); 
  expect(derivedAtom.get().v).toBe(3);
});

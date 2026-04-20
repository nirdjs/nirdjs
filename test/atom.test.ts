import { expect, mock, test } from "bun:test";
import { atom, batch } from "../src/atom";
import { createAtomStore, setStoreProvider } from "../src/store";

test("atom — should return initial value on get()", () => {
  const numAtom = atom(2);
  expect(numAtom.get()).toBe(2);
});

test("atom — should generate unique string representation", () => {
  const aAtom = atom(2);
  const bAtom = atom(2);
  const aAtomStr = aAtom.toString();
  const bAtomStr = bAtom.toString();
  expect(aAtomStr).toMatch(/atom:[0-9]+: \[2\]/);
  expect(bAtomStr).toMatch(/atom:[0-9]+: \[2\]/);
  expect(aAtomStr === bAtomStr).toBeFalse();
});

test("atom — should update value on set()", () => {
  const numAtom = atom(2);
  numAtom.set(3);
  expect(numAtom.get()).toBe(3);
  numAtom.set(4);
  expect(numAtom.get()).toBe(4);
});

test("atom — should notify subscribers on change", () => {
  const numAtom = atom(2);
  const mockFn = mock((next: number, prev: number) => {});
  numAtom.sub(mockFn);
  numAtom.set(3);
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn.mock.calls[0]).toEqual([3, 2]);
});

test("batch — should postpone notifications until the end", async () => {
  const numAtom = atom(2);
  const mockFn = mock(() => {});
  numAtom.sub(mockFn);

  await batch(() => {
    numAtom.set(3);
    expect(mockFn).toHaveBeenCalledTimes(0);
  });

  expect(numAtom.get()).toBe(3);
  expect(mockFn).toHaveBeenCalledTimes(1);
});

test("batch — should allow nested batch calls", async () => {
  const a = atom(0);
  const subscriber = mock(() => {});
  a.sub(subscriber);

  await batch(async () => {
    await batch(async () => {
      a.set(1);
    });
    expect(subscriber).toHaveBeenCalledTimes(0);
    a.set(2);
  });

  expect(subscriber).toHaveBeenCalledTimes(2);
  expect(a.get()).toBe(2);
});

test("batch — should isolate batching state per store (SSR safety)", async () => {
  const store1 = createAtomStore();
  const store2 = createAtomStore();
  
  const a1 = atom(0);
  const a2 = atom(0);
  
  const sub1 = mock(() => {});
  const sub2 = mock(() => {});

  setStoreProvider(() => store1);
  a1.sub(sub1);
  
  setStoreProvider(() => store2);
  a2.sub(sub2);

  setStoreProvider(() => store1);
  const p1 = batch(async () => {
    a1.set(1);
    
    setStoreProvider(() => store2);
    await batch(async () => {
      a2.set(1);
    });
    // Store 2 batch finished independently
    expect(sub2).toHaveBeenCalledTimes(1);
    
    setStoreProvider(() => store1);
    expect(sub1).toHaveBeenCalledTimes(0); // Store 1 batch still active
  });

  await p1;
  expect(sub1).toHaveBeenCalledTimes(1);
});

test("unsub — should throw with correct verb in message", () => {
  const a = atom(0);
  expect(() => a.unsub(null as any)).toThrow("Couldn't remove atom sub");
});

test("safety — should throw when setting function without allowFnValue", () => {
  const a = atom<any>(0);
  expect(() => a.set(() => {})).toThrow("atom.set(fn) is not allowed by default");
});

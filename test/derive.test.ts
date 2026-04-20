import { expect, mock, test } from "bun:test";
import { atom } from "../src/atom";
import { NeverSet, derive } from "../src/derive";

test("derive — read-only: should update when source updates", () => {
  const sourceAtom = atom({ a: "1" });
  const derivedAtom = derive(sourceAtom, ({ a }) => a, NeverSet);
  const mockFn = mock(() => {});
  
  expect(derivedAtom.get()).toBe("1");
  derivedAtom.sub(mockFn);
  
  sourceAtom.set({ a: "2" });
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn.mock.calls[0]).toEqual(["2", "1"]);
  expect(derivedAtom.get()).toBe("2");
});

test("derive — read-only: should support nested derivation", () => {
  const aAtom = atom({ a: "some string" });
  const bAtom = derive(aAtom, ({ a }) => a, NeverSet);
  const cAtom = derive(bAtom, (a) => a.length, NeverSet);

  expect(cAtom.get()).toBe(11);
  
  const mockFn = mock(() => {});
  cAtom.sub(mockFn);
  
  aAtom.set({ a: "another string" });
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn.mock.calls[0]).toEqual([14, 11]);
  expect(cAtom.get()).toBe(14);
});

test("derive — writable: should notify subscribers exactly once on set()", () => {
  const sourceAtom = atom(1);
  const derivedAtom = derive(
    sourceAtom,
    (val) => ({ value: val }),
    (next) => next.value
  );

  const subscriber = mock(() => {});
  derivedAtom.sub(subscriber);

  derivedAtom.set({ value: 2 });
  expect(derivedAtom.get().value).toBe(2);
  expect(sourceAtom.get()).toBe(2);
  expect(subscriber).toHaveBeenCalledTimes(1);
});

test("derive — lifecycle: should use reference counting to subscribe to source", () => {
  const source = atom(0);
  const d1 = derive(source, (v) => v + 1, (v) => v - 1);
  const d2 = derive(d1, (v) => v * 2, (v) => v / 2);
  
  expect(source.subCount()).toBe(0);
  expect(d1.subCount()).toBe(0);
  
  const mockFn = mock(() => {});
  d2.sub(mockFn);
  
  expect(d2.subCount()).toBe(1);
  expect(d1.subCount()).toBe(1);
  expect(source.subCount()).toBe(1);
  
  d2.unsub(mockFn);
  
  expect(d2.subCount()).toBe(0);
  expect(d1.subCount()).toBe(0);
  expect(source.subCount()).toBe(0);
});

test("derive — lifecycle: should ensure fresh value on get() even when not subscribed", () => {
  const source = atom(10);
  const derived = derive(source, (v) => v * 2, NeverSet);
  
  expect(derived.get()).toBe(20);
  
  source.set(30);
  // get() should still return fresh value even though no one is subscribed
  expect(derived.get()).toBe(60);
});

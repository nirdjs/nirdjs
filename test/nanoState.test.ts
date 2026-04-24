import { expect, mock, test } from "bun:test";
import { nano } from "../src/nanoState";

test("get", () => {
  const numAtom = nano(2);
  expect(numAtom.get()).toBe(2);
});

test("set one time", () => {
  const numAtom = nano(2);
  numAtom.set(3);
  expect(numAtom.get()).toBe(3);
});

test("set two times", () => {
  const numAtom = nano(2);
  numAtom.set(3);
  numAtom.set(4);
  expect(numAtom.get()).toBe(4);
});

test("sub", () => {
  const numAtom = nano(2);
  const fn = (_nextValue: number) => {};
  const mockFn = mock(fn);
  numAtom.sub(mockFn);
  numAtom.set(3);
  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn.mock.calls[0]).toEqual([3]);
});

test("unsub — should stop notifications after unsubscribe", () => {
  const n = nano(0);
  const subscriber = mock((_v: number) => {});
  n.sub(subscriber);

  n.set(1);
  expect(subscriber).toHaveBeenCalledTimes(1);

  n.unsub(subscriber);
  n.set(2);
  // Should not be called again after unsub
  expect(subscriber).toHaveBeenCalledTimes(1);
});

test("unsub — should not corrupt other subscribers when unsubbing unknown function", () => {
  const n = nano(0);
  const realSubscriber = mock((_v: number) => {});
  const neverAdded = (_v: number) => {};

  n.sub(realSubscriber);

  // Unsub a function that was never added — must not remove realSubscriber
  n.unsub(neverAdded);

  n.set(1);
  // realSubscriber should still be active
  expect(realSubscriber).toHaveBeenCalledTimes(1);
  expect(realSubscriber.mock.calls[0]).toEqual([1]);
});

test("unsub — double unsub should be safe", () => {
  const n = nano(0);
  const subscriber = mock((_v: number) => {});
  n.sub(subscriber);

  n.unsub(subscriber);
  // Second unsub should be a no-op, not throw or corrupt
  n.unsub(subscriber);

  n.set(1);
  expect(subscriber).toHaveBeenCalledTimes(0);
});

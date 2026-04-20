import { expect, test } from "bun:test";
import { atom } from "../src/atom";
import { propertyAtom } from "../src/propertyAtom";

test("propertyAtom — should derive a single property into a new atom", () => {
  const oAtom = atom({ a: "1", b: "2" });
  const aAtom = propertyAtom(oAtom, "a");

  expect(aAtom.get()).toBe("1");
});

test("propertyAtom — should propagate updates to source atom", () => {
  const oAtom = atom({ a: "1", b: "2" });
  const aAtom = propertyAtom(oAtom, "a");

  aAtom.set("10");

  expect(oAtom.get()).toEqual({ a: "10", b: "2" });
});

test("propertyAtom — should correctly handle arrays", () => {
  const listAtom = atom([1, 2, 3]);
  const firstEltAtom = propertyAtom(listAtom, 0);
  
  expect(firstEltAtom.get()).toBe(1);
  
  firstEltAtom.set(10);
  
  expect(listAtom.get()).toEqual([10, 2, 3]);
  expect(Array.isArray(listAtom.get())).toBeTrue();
});

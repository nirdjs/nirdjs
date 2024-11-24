import { atom } from "./atom";
import { useValue } from "./useValue";

// biome-ignore lint/complexity/noBannedTypes: It's actually component with no attributes
export type NoAttributesType = {};

export const replaceArrayElt = <Value>(
  array: Array<Value>,
  index: number,
  nextValue: Value,
): Array<Value> => ([
  ...array.slice(0, index),
  nextValue,
  ...array.slice(index + 1),
]);

const snap = <Value>(value: Value) => {
  const a = atom(value);
  return [() => useValue(a), a.update, a.get, a.sub, a.unsub];
};

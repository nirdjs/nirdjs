import { useEffect, useState } from "react";

export const nano = <T>(i: T) => {
  let v = i;
  const subs = new Set<(n: T) => void>();

  return {
    get: () => v,
    set: (n: T) => {
      if (v !== n) {
        v = n;
        for (const sub of subs) {
          sub(n);
        }
      }
    },
    sub: (s: (n: T) => void) => subs.add(s),
    unsub: (s: (n: T) => void) => subs.delete(s),
  };
};

export const useNano = <T>(n: ReturnType<typeof nano<T>>): T => {
  const [value, setValue] = useState(n.get());

  useEffect(() => {
    n.sub(setValue);
    return () => {
      n.unsub(setValue);
    };
  }, [n]);

  return value;
};

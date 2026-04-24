import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { atom } from "../src/atom";
import {
  asyncLocalStorageStoreProvider,
  execWithAtom,
} from "../src/ssr/AsyncLocalStorageAtomProvider";
import {
  createAtomStore,
  disableDefaultStore,
  getDefaultStore,
  getStore,
  setStoreProvider,
} from "../src/store";
import { useValue } from "../src/useValue";

const aAtom = atom(1);

const Comp = () => {
  const value = useValue(aAtom);
  return <button>{value}</button>;
};

test("render two pages at the same time", () => {
  const savedDefaultStore = getDefaultStore();
  disableDefaultStore();
  setStoreProvider(asyncLocalStorageStoreProvider);
  const page1 = execWithAtom(createAtomStore(), () => {
    const comp = <Comp />;
    aAtom.set(10);
    return renderToString(comp);
  });
  const page2 = execWithAtom(createAtomStore(), () => {
    const comp = <Comp />;
    aAtom.set(20);
    return renderToString(comp);
  });

  expect(page1).toEqual("<button>10</button>");
  expect(page2).toEqual("<button>20</button>");

  setStoreProvider(() => savedDefaultStore);
});

test("disableDefaultStore — default provider should throw after disable", () => {
  // defaultStore was already disabled by the previous test.
  // Verify that a provider routed through getDefaultStore() throws.
  expect(() => getDefaultStore()).toThrow(
    "default store was disable",
  );

  // Verify that getStore() also throws when pointed at the default provider
  setStoreProvider(() => getDefaultStore());
  expect(() => {
    getStore();
  }).toThrow("default store was disable");

  // Restore a working provider so subsequent tests aren't affected
  const freshStore = createAtomStore();
  setStoreProvider(() => freshStore);
});

// FIXME test with async

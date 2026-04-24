import { expect, test, mock } from "bun:test";
import React, { useState } from "react";
import { renderToString } from "react-dom/server";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { atom } from "../src/atom";
import { useValue } from "../src/useValue";

test("useValue — should render current atom value", () => {
  const numAtom = atom(42);
  const Comp = () => {
    const value = useValue(numAtom);
    return <span>{value}</span>;
  };
  expect(renderToString(<Comp />)).toBe("<span>42</span>");
});

test("useValue — should re-render when atom value changes", async () => {
  const numAtom = atom(1);

  const renders: number[] = [];
  const Comp = () => {
    const value = useValue(numAtom);
    renders.push(value);
    return <div>{value}</div>;
  };

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(() => {
    root.render(<Comp />);
  });
  expect(renders[renders.length - 1]).toBe(1);

  await act(() => {
    numAtom.set(2);
  });
  expect(renders[renders.length - 1]).toBe(2);

  await act(() => {
    numAtom.set(3);
  });
  expect(renders[renders.length - 1]).toBe(3);

  root.unmount();
  document.body.removeChild(container);
});

test("useValue — should sync immediately when atom reference changes (stale-closure fix)", async () => {
  const atomA = atom("A");
  const atomB = atom("B");

  const renders: string[] = [];

  const Wrapper = () => {
    const [useAtomA, setUseAtomA] = useState(true);
    const currentAtom = useAtomA ? atomA : atomB;
    const value = useValue(currentAtom);
    renders.push(value);

    return (
      <div>
        <span id="value">{value}</span>
        <button id="switch" onClick={() => setUseAtomA(false)}>
          Switch
        </button>
      </div>
    );
  };

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(() => {
    root.render(<Wrapper />);
  });
  // Initially renders with atomA's value
  expect(renders[renders.length - 1]).toBe("A");

  // Swap to atomB — useValue should immediately sync to "B"
  await act(() => {
    const btn = container.querySelector("#switch") as HTMLButtonElement;
    btn.click();
  });

  // After the swap, the component should render with atomB's value "B",
  // NOT the stale atomA value "A"
  expect(renders[renders.length - 1]).toBe("B");

  // Verify atomB updates still flow through
  await act(() => {
    atomB.set("B2");
  });
  expect(renders[renders.length - 1]).toBe("B2");

  // Verify atomA updates no longer trigger re-render
  const renderCountBefore = renders.length;
  await act(() => {
    atomA.set("A2");
  });
  expect(renders.length).toBe(renderCountBefore);

  root.unmount();
  document.body.removeChild(container);
});

test("useValue — should unsubscribe on unmount", async () => {
  const numAtom = atom(0);
  expect(numAtom.subCount()).toBe(0);

  const Comp = () => {
    const value = useValue(numAtom);
    return <span>{value}</span>;
  };

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(() => {
    root.render(<Comp />);
  });
  expect(numAtom.subCount()).toBe(1);

  root.unmount();
  // After unmount, subscription should be cleaned up
  expect(numAtom.subCount()).toBe(0);

  document.body.removeChild(container);
});

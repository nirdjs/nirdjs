# What is Nird

Nird is an atomic state management library for React.


```jsx

// https://playcode.io/2166584

import { atom, useValue } from 'nirdjs';

const counterAtom = atom(0);

export const useCounter = () => useValue(counterAtom);
export const inc = () => counterAtom.update(prev => prev + 1);

// Counter.tsx

export const App = () => {
  const counter = useCounter();

  return <button onClick={inc}>clicked {counter} times</button>;
};

```

## Un-hooked `useCounter` and `inc`

Now `useCounter()` is extremly simple to use: it only does two things.

First, it returns the value of the current value of the counter.

Second, as any React hook, it subscribes the component to changes of the counter. 
So, when a counter changes then the component re-renders. 

Also, notice that the function references `inc` and `useCounter` never change and as result never cause function-reference-changed re-renders.

# Derived atoms

```jsx

// word.ts 

const wordAtom = atom("compatibility");
const lettersAtom = derivedAtom(wordAtom, (word) => word.length, NeverSet)

export const useWord = () => useValue(wordAtom)
export const setWord = atomSetter(wordAtom)

export const useLetters = () => useValue(lettersAtom)


// Counter.tsx

const WordAndLetters = () => {
  const word = useWord();
  const letters = useLetters();

  return <>
    <p>
      <input onChange={e => setWord(e.target.value)}/>
    </p>
    <p>
      Word "{word}" contains {letters} letters.
    </p>
  </>    
}

```

## Split array atoms


```jsx
import { expect, mock, test } from "bun:test";
import { splitAtom } from "../src/arrays";
import { atom, type Atom } from "../src/Nird";

test("atomList does not change when single value changes", () => {
  const arrayAtom = atom([10, 20]);
  const splitArrayAtom = splitAtom(arrayAtom);

  const atom0: Atom<number> = splitArrayAtom.get()[0];
  const atom1: Atom<number> = splitArrayAtom.get()[1];

  const nopFn = () => { }
  const subAtomMock = mock(nopFn as any)
  const sub0 = mock(nopFn as any)
  const sub1 = mock(nopFn as any)

  /// test


  splitArrayAtom.sub(subAtomMock)
  atom0.sub(sub0);
  atom1.sub(sub1);

  atom0.set(0);

  expect(sub0).toHaveBeenCalledTimes(1);

  expect(sub1).toHaveBeenCalledTimes(0);

  expect(subAtomMock).toHaveBeenCalledTimes(0);
});

```

# Using Provider for SSR

```jsx

const aAtom = atom(1);

const Comp = ({}) => {
  const value = useValue(aAtom)
  return <button>
    {value}
  </button>
}


test("render two pages at the same time", () => {
  const page1 = execWithAtom(createAtomStore(), () => {
    const comp = <Comp />
    aAtom.set(10);
    return renderToString(comp)
  })
  const page2 = execWithAtom(createAtomStore(), () => {
    const comp = <Comp />
    aAtom.set(20);
    return renderToString(comp)
  })

  expect(page1).toEqual("<button>10</button>")
  expect(page2).toEqual("<button>20</button>")
});

```

# Install

```sh

npm add nirdjs

# or

bunx 

# or

deno add Nird

```

This command will add the following line to your `package.json` file

```json
{
  //in package.json, 
  "Nird": "npm:@jsr/kaigorod__Nird",
}
```


```
import { atom, atomGetter, atomSetter, useValue } from "atom";

const isImageSearchOnAtom = atom(false);

export const useIsImageSearchOn = () => useValue(isImageSearchOnAtom);
export const setIsImageSearchOn = atomSetter(isImageSearchOnAtom);
```




# Inspiration
Nird is inspired by recoil and jotai state management libraries.

# Links

- Github Repo https://github.com/nirdjs/nirdjs
- Deno JSR Package https://jsr.io/nirdjs
- NPM https://www.npmjs.com/package/nirdjs

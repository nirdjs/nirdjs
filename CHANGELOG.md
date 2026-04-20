# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **Bug 1 & 2 (Hooks)**: Added missing `useEffect` dependency arrays in `useValue` and `useNano` to prevent redundant re-subscriptions on every render.
- **Bug 3 (Derive)**: Fixed double notification in `derive.set()` by synchronizing through the source atom only.
- **Bug 4 (Arrays)**: Fixed `splitAtom` to correctly handle array length changes and maintain stability of the atom list.
- **Bug 5 (Batching)**: Updated `batch()` signature to support `Promise<void>` and enabled nested batching via a depth counter.
- **Bug 6 (Atom)**: Fixed typo in `unsub` error message ("add" -> "remove").
- **Bug 7 (Atom)**: Changed silent failure in `atom.set(fn)` to throw a descriptive Error when `allowFnValue` is false.

### Verified
- Integrated comprehensive regression tests for all fixed bugs into the main test suite.

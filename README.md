# React from Scratch

A custom React-like engine built from scratch in TypeScript. This project was created for educational purposes to deeply understand how React works under the hood.

## Engine Features

- **Fiber Architecture & Concurrent Mode:** Rendering is broken down into small units of work using `requestIdleCallback` to avoid blocking the main thread.
- **Hooks:** Support for essential hooks with strict call order tracking (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`).
- **Optimization & Bailout:** Implemented `MyReact.memo` to prevent unnecessary re-renders (via smart Fiber tree cloning).
- **StrictMode:** Double-invocation of functional components and effects (React 18 style) to catch impure functions and side-effects.
- **JSX & DOM:** Custom `createElement`, reconciliation via `commitWork`, and support for `ref` and `Fragment`.

## Installation & Setup

Due to `react-scripts` configuration and strict JSX typing requirements in this educational environment, specific dependency versions are required.

1. Install all dependencies (using the `--legacy-peer-deps` flag to avoid React utility version conflicts):
   ```bash
   npm install --legacy-peer-deps
   ```

2. Force install TypeScript 4.9.5 (required for proper JSX type compatibility):
   ```bash
   npm install --save-dev typescript@4.9.5
   ```

3. Start the project:
   ```bash
   npm start
   ```

## Architecture Documentation

*To be written...*

## Acknowledgments

Special thanks to [Rodrigo Pombo](https://github.com/pomber) for [Didact tutorial](https://pomb.us/build-your-own-react/) that helped me build the basics
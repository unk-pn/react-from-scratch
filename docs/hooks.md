## Where do hooks live?

All hooks that we call in component take their place in `fiber.hooks` - array of all hooks described like objects.

When our component updates, `updateFunctionComponent` function does two main things:

1. Write current `fiber` into `state.wipFiber`
2. Resets `state.hookIdx = 0`

Every time when any hook is called in component this hook looks into `state.wipFiber` to know in which component it is currently working and to get his `hookIdx`

## Why can't we write hooks in conditions?

Hooks don't have names or IDs, so they only rely on their `hookIdx`.

Imagine this situation:

```jsx
if (condition) {
  const [state, setState] = useState(0)
}

useEffect(() => { ... }, [])
```

Lets consider two renders:

1. Render 1 (`condition === true`):
   - `useState` is called first, so it gets index `0` and stores the number `0`.
   - `useEffect` is called second and gets index `1`.

2. Render 2 (`condition === false`):
   - `useState` is skipped!
   - `useEffect` is now the first hook called, so it gets index `0`.

**See where it all goes?**

On Render 2, `useEffect` asks the engine for data at index `0`. The engine blindly gives it the number `0` (which belonged to useState from the previous render)! `useEffect` expects a function and dependencies, but receives a string. The app crashes immediately.

_Hooks order must stay exactly the same between all renders. Do not put them inside conditions or loops._

React documentation: [Only Call Hooks at the Top Level](https://react.dev/reference/rules/rules-of-hooks#only-call-hooks-at-the-top-level)

## How do hooks work?

Almost every hook follows these 4 steps:

1. Take an old hook from `fiber.alternate.hooks[hookIdx]`
2. Makes the decision:

   - If we got an old hook then we take its state
   - If we don't have an old hook (first render) then we initialize it

3. Create a hook object and push it into `fiber.hooks`, then we do `state.hookIdx++`
4. Return hook result

## Synchronous vs Deferred Hooks

1. Synchronous (like `useState` or `useMemo`) – they make all the work right in render time and return the result to component

2. Deferred (like `useEffect`) – doesn't do anything at render time (only push to `fiber.hooks`). The hook will run later - after reconciler will finish building the DOM (in `commitRoot` we run `runEffects`)

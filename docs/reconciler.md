## `render`

In [`index.tsx`](../src/index.tsx) we have this code: 

```jsx
const element = (
  <MyReact.StrictMode>
    <App />
  </MyReact.StrictMode>
)

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root container not found!')

MyReact.render(element, rootElement)
```

Where `rootElement` is DOM node where we will place our `element`.

`render` function is simple, but to understand how it works we need to introduce two global variables:

* `wipRoot` - part of our "Virtual DOM". It's a "draft" tree (Work-In-Progress Root) that we build in memory. We won't touch real browser DOM until this draft is finished
* `nextUnitOfWork` - work that will be done in next "iteration" when the browser has free time (in our `workLoop` function that we will discuss later)

`render` function does two simple things:

* sets the `wipRoot` 
* sets `nextUnitOfWork` to our `wipRoot` to process it

## `workLoop`

Next we have a `workLoop` function, we need it to process `nextUnitOfWork`. When browser is free (isn't handling users input for example, we use `requestIdleCallback` in out code to get this) we proceed to perform our `nextUnitOfWork` with `performUnitOfWork` function.

In `performUnitOfWork` we use DFS: Trying to get down to `fiber.child`, if we don't have it then we are trying to get to `fiber.sibling`, if we don't have it then we go up to `parent.parent`.

For example:

```jsx
const element = (
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>
)
```

From `#root` we are going down (children): `<div>` -> `<h1>` -> `<p>`.

`<p>` has no child, then we are trying to get his sibling: `<a>`, who has no sibling, so we are going up to our parent `<h1>`.

We have already processed `<h1>`'s children, so we will check his sibling: `<h2>`, who has no children or sibling, so we are going up again.

`<div>` also has no siblings, then we go up: `#root`.

When the loop ends and `nextUnitOfWork` becomes `null`, it means our draft (`wipRoot`) is ready. Then we call `commitRoot` to apply all changes to the actual DOM.

*For every node in `performUnitOfWork` we figure out whats its children are (by executing component function or reading the children prop) to pass them into `reconcileChildren` function.*

## `commitRoot` && `commitWork`

When `workLoop` finishes traveling across the tree and `nextUnitOfWork` becomes `null`, it means that our "draft" tree (`wipRoot`) is fully built and all `effectTag`s are assigned. Now it's time to actually work with real browser DOM (we will do it in `commitRoot`).

We call `commitWork` which recursively goes through all Fibers and looks at their `effectTag`:

1) 'PLACEMENT' - we append `fiber.dom` into its parents DOM
2) 'UPDATE' - we compare old and new props (`className`, `onClick` and others) and update the DOM
3) 'DELETION' - we remove the DOM node from the parent and run `cleanup` functions for our hooks

*We handle deletions first (in `commitRoot` we do `state.deletions.forEach(commitWork)` in the start) and then process the rest of the tree. After the DOM is updated, we call runEffects*

## `reconcileChildren`

In `reconcileChildren` we are comparing new children (what has our component return) and old fiber.

We are going through the array of new elements and old fibers and check for type equality: `element.type === oldFiber.type`:

1) If type matches (was `<div>` and remained `<div>`) we create new Fiber with `effectTag: 'UPDATE'`. DOM remains untouched because we only update props (not recreating fiber)
2) If type doesn't match (was `<h1>` and became `<h2>`, or we don't even have an old element) we create new Fiber with `effectTag: 'PLACEMENT'` (create DOM from scratch)
3) If we have an old Fiber but don't have a new one (tab switched for example) then we change `effectTag` in current Fiber to be `'DELETION'` and it goes to `state.deletions`

**What about `key` props?**

If we have a list of elements (created via `.map()` for example) they can change their order. To avoid re-creating DOM nodes we use `key` props. We have `Map`, where key is `key` prop, and value is Fiber.

When looking for new elements we just use our map. If map has that `key` then we just reuse that Fiber even if its index in array has changed

## What's the difference?

You may have already seen that we have `Fiber`s and `MyReactElement`s and might wonder: "What's the difference?". Let's figure it out.

## `MyReactElement`

It's a lightweight JS object, it looks like that: 

```js
{
  type: "div",
  props: {
    id: "foo",
    children: [...],
    ...
  },
}
```

It doesn't have: 

* State
* DOM node
* Hooks
* Links to parent / sibling / child

In short: `MyReactElement` is a "description" of how a component should look like right now.

With every render thousands of `MyReactElement`s could be created and thrown away by the garbage collector.

## `Fiber`

It's a "living" object, it exists throughout the lifetime of the component. It looks like this:

```js
{
  type: "div",
  props: {
    id: "foo",
    ...
  },
  parent: { ... },
  child: { ... },
  sibling: { ... },
  dom: HTMLElement,
  alternate: { ... },
  effectTag: "UPDATE",
  hooks: [...],
  isStrict: true,
}
```

*All types can be seen in [`src/MyReact/types.ts`](../src/MyReact/types.ts)*

It:

* Has a link to a DOM node (`fiber.dom`)
* Keeps all the state and hooks of the component (`fiber.hooks`)
* Has a link with others fibers in the tree (`fiber.parent`, `fiber.sibling`, `fiber.child`) as a linked list
* Keeps a link to its previous render (`fiber.alternate` - old version of itself)


## How do they work together?

In `reconcileChildren` function you may have noticed that we have `Fiber` and array of `MyReactElement`s working together, lets take this logic apart.

We take `Fiber` and new `MyReactElement` and comparing them by type:

1) If `Fiber` has type `"div"` (`fiber.type`) and `MyReactElement` has type `"div"` (`element.type`) then we update `effectTag` to be `"UPDATE"`
2) If `Fiber` has type `"h1"` (`fiber.type`) and `MyReactElement` has type `"h2"` (`element.type`) then we delete old `Fiber` (`fiber.effectTag = "DELETION"`) and create a new one with `effectTag = "PLACEMENT"`
## Commit phase

When our component updates (for example we call setState):

1. We add `action` to hook queue: `hook.queue.push(action)`
2. Create new `wipRoot` (to rerender with new data), it is a clone of `currentRoot` and we set it `state.nextUnitOfWork = state.wipRoot`
3. Browser starts the `workLoop` function (in its free time) and starts building a new Fiber tree

When we are going through the Fiber tree we are creating new DOM nodes (with `document.createElement`) but not appending them to real DOM (we only make them appear in the `fiber.dom` and give them `effectTags`)

When the loop ends (`nextUnitOfWork === null`), we call the `commitRoot` function to apply all changes to the actual DOM in one go.

Inside `commitRoot`, we start a recursive function `commitWork` that travels down our finished tree. Depending on the `effectTag` of each Fiber, it either places a new node, deletes an old one, or updates an existing one.

## How `updateDom` works?

When `commitWork` encounters a Fiber with an `UPDATE` tag, it needs to sync the real DOM node with our new props. It calls the `updateDom` function to do this.

Here is how it works:

1. First, we look at the old props (`alternate.props`).

   - If it's a regular property (like `id` or `className`) that doesn't exist in the new props anymore, we set it to an empty string to remove it.
   - If it's an event listener (any prop starting with `on`, like `onClick`), we call `removeEventListener` to detach the old function (to prevent memory leaks).

2. Then, we look at the new props.

   - If it's a regular property, we simply assign it to the DOM node (e.g. `dom.id = "newId"`). We also have special handling for `style` objects to apply them correctly.
   - If it's an event listener, we extract the event name (e.g., `onClick` becomes `click` in lowercase) and call `addEventListener` to attach the new function.

This guarantees that our DOM always precisely reflects the latest state of our component, without having to recreate the entire DOM node from scratch.

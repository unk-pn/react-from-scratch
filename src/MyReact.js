/**
 * @typedef {Object} MyReactElement
 * @property {string | Function} type
 * @property {Object} props
 * @property {Array<MyReactElement | string | number | null | undefined>} [props.children]
*/

const MyReact = {
  createElement,
  render,
}
export default MyReact

const ElementTypes = {
  text: "TEXT_ELEMENT",
}

/**
 * @typedef {Object} Fiber
 * @property {string | Function} type
 * @property {Object} props
 * @property {Fiber | null} parent
 * @property {Fiber | null} child
 * @property {Fiber | null} sibling
 * @property {HTMLElement | Text | null} dom
 */

/**
 * Creates a React-like element Object
 * 
 * @param {string | function} type - HTML tag name or component type
 * @param {object} [props] - Element props
 * @param {...(MyReactElement | string | number | null | undefined)} children
 * @returns {MyReactElement}
*/
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => 
        typeof child === "object" && child !== null
          ? child
          : createTextElement(child)
      )
    }
  }
}

/**
 * Wraps a text into a React-like element object
 * 
 * @param {string | number} text 
 * @returns {MyReactElement}
*/
function createTextElement(text) {
  return {
    type: ElementTypes.text,
    props: {
      nodeValue: text,
      children: [],
    }
  }
}

/**
 * Creates a DOM node
 * 
 * @param {MyReactElement | null | undefined} fiber 
 * @returns {MyReactElement}  
*/
function createDom(fiber) {
  const dom = fiber.type === ElementTypes.text 
    ? document.createTextNode("") 
    : document.createElement(fiber.type)

  const isProperty = key => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    });

  return dom
}

/**
 * Renders a React-like element into the DOM
 * 
 * @param {MyReactElement | null | undefined} element 
 * @param {HTMLElement} container 
 * @returns {void}  
*/
function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    }
  }
}

let nextUnitOfWork = null

/**
 * Executes the pending render work during browser idle time.
 * The loop keeps processing fibers until the browser says the remaining
 * time is too low, then it schedules the next idle callback.
 *
 * @param {IdleDeadline} deadline - Browser-provided object with timeRemaining()
 * @returns {void}
 */
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

/**
 * Processes a single fiber and returns the next fiber to continue traversal.
 * The function creates the DOM node for the current fiber, attaches it to
 * the parent, and links child/sibling fibers into a tree.
 *
 * @param {Fiber} fiber - The current fiber to work on.
 * @returns {Fiber | null} The next fiber that should be processed, or null if done.
 */
function performUnitOfWork(fiber) {
  // Create new node and append it to the DOM
  if (!fiber.dom)
    fiber.dom = createDom(fiber)

  if (fiber.parent)
    fiber.parent.dom.appendChild(fiber.dom)

  // Create a child for every new fiber
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    // Add to fiber tree
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  if (fiber.child) return fiber.child 

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling)
      return nextFiber.sibling

    nextFiber = nextFiber.parent
  }
}
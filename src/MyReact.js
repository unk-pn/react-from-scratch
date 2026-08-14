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
 * Renders a React-like element into the DOM
 * 
 * @param {MyReactElement | null | undefined} element 
 * @param {HTMLElement} container 
 * @returns {void}  
*/
function render(element, container) {
  const dom = element.type === ElementTypes.text 
    ? document.createTextNode("") 
    : document.createElement(element.type)

  const isProperty = key => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    });

  element.props.children.forEach(child => 
    render(child, dom)
  );

  container.appendChild(dom)
}

let nextUnitOfWork = null
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
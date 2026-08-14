import { EffectTags, ElementTypes } from "./constants"
import { 
  isEvent,
  isProperty,
  isNew,
  isGone
} from "./helpers"

const MyReact = {
  createElement,
  render,
}
export default MyReact

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

function createTextElement(text) {
  return {
    type: ElementTypes.text,
    props: {
      nodeValue: text,
      children: [],
    }
  }
}

function createDom(fiber) {
  const dom = fiber.type === ElementTypes.text 
    ? document.createTextNode("") 
    : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
}

function updateDom(dom, prevProps, nextProps) {
  // Remove old / changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)

      dom.removeEventListener(eventType, prevProps[name])
    })
  
  // Remove old props
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new / changed props
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Set new event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)

      dom.addEventListener(eventType, nextProps[name])
    })
}

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber || !fiber.parent || !fiber.parent.dom) return

  const domParent = fiber.parent.dom

  if (fiber.dom !== null) {
    switch (fiber.effectTag) {
      case EffectTags.place:
        domParent.appendChild(fiber.dom)
        break

      case EffectTags.update:
          updateDom(fiber.dom, fiber.alternate.props, fiber.props)
          break

      case EffectTags.delete:
          domParent.removeChild(fiber.dom)
          break
    }
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot,
  }

  deletions = []
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining < 1
  }

  if (!nextUnitOfWork && wipRoot) commitRoot()

  requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  if (!fiber.dom)
    fiber.dom = createDom(fiber)

  const elements = fiber.props.children
  reconcileChildren(fiber, elements)

  if (fiber.child) return fiber.child 

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling)
      return nextFiber.sibling

    nextFiber = nextFiber.parent
  }
}

function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: EffectTags.update,
      }
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: null,
        alternate: null,
        effectTag: EffectTags.place,
      }
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = EffectTags.delete
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}
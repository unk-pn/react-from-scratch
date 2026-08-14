import { EffectTags, ElementTypes } from "./constants"
import { 
  isEvent,
  isProperty,
  isNew,
  isGone,
  isDepsEqual
} from "./helpers"

const MyReact = {
  createElement,
  render,
  useState,
  useEffect,
}
export default MyReact

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat()
        .filter(child => child !== null && child !== undefined && child !== false)
        .map((child) => 
          typeof child === "object"
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
  const props = fiber.props || {}

  const dom = fiber.type === ElementTypes.text 
    ? document.createTextNode("") 
    : document.createElement(fiber.type)

  updateDom(dom, {}, props)

  return dom
}

function updateDom(dom, prevProps, nextProps) {
  const prev = prevProps || {}
  const next = nextProps || {}

  // Remove old / changed event listeners
  Object.keys(prev)
    .filter(isEvent)
    .filter(key => !(key in next) || isNew(prev, next)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)

      dom.removeEventListener(eventType, prev[name])
    })
  
  // Remove old props
  Object.keys(prev)
    .filter(isProperty)
    .filter(isGone(prev, next))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new / changed props
  Object.keys(next)
    .filter(isProperty)
    .filter(isNew(prev, next))
    .forEach(name => {
      if (name === "style") {
        Object.keys(next.style || {}).forEach(key => {
          dom.style[key] = next.style[key]
        })
        return
      }
      dom[name] = next[name]
    })

  // Set new event listeners
  Object.keys(next)
    .filter(isEvent)
    .filter(isNew(prev, next))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)

      dom.addEventListener(eventType, next[name])
    })
}

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)

  runEffects()

  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) return

  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  switch (fiber.effectTag) {
    case EffectTags.place:
      if (fiber.dom !== null)
        domParent.appendChild(fiber.dom)
      break

    case EffectTags.update:
      if (fiber.dom !== null)
        updateDom(fiber.dom, fiber.alternate.props, fiber.props)
      break

    case EffectTags.delete:
      if (fiber.hooks) {
        fiber.hooks.forEach(hook => {
          if (hook.cleanup) hook.cleanup()
        })
      }

      if (!fiber.dom) {
        commitDeletion(fiber, domParent)
      } else {
        domParent.removeChild(fiber.dom)
      }
      break
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent) {
  if (!fiber) return

  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
    return 
  }
  
  if (fiber.child) {
    commitDeletion(fiber.child, domParent)
  }

  if (fiber.sibling) {
    commitDeletion(fiber.sibling, domParent)
  }
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
  const isFunctionComponent = fiber.type instanceof Function

  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  if (fiber.child) return fiber.child 

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling)
      return nextFiber.sibling

    nextFiber = nextFiber.parent
  }
}

let wipFiber = null
let hookIdx = null

function updateFunctionComponent(fiber) {
  wipFiber = fiber
  hookIdx = 0
  wipFiber.hooks = []

  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function useState(initial) {
  const oldHook = 
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIdx]
  
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => 
    hook.state = action(hook.state)
  )

  function setState(action) {
    const nextAction = typeof action === "function" ? action : () => action

    hook.queue.push(nextAction)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    }

    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIdx++
  return [hook.state, setState]
}

function useEffect(callback, deps) {
  const oldHook = 
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIdx]

  const oldDeps = oldHook ? oldHook.deps : undefined
  const hasChanged =
    !oldDeps ||
    deps.some((dep, index) => dep !== oldDeps[index])
  
  const hook = {
    deps,
    effect: callback,
    cleanup: null,
    hasChanged,
  }

  if (hasChanged) {
    hook.cleanup = oldHook && oldHook.cleanup
  }

  if (wipFiber.hooks) {
    wipFiber.hooks.push(hook)
    hookIdx++
  }
}

function runEffects() {
  const effects = []
  collectEffects(wipRoot, effects)

  effects.forEach(effect => {
    if (effect.cleanup) effect.cleanup()
      effect.cleanup = effect.effect()
  })
}

function collectEffects(fiber, effects) {
  if (!fiber) return

  if (fiber.hooks) {
    fiber.hooks.forEach(hook => {
      if (hook.hasChanged) {
        effects.push(hook)
      }
    })
  }

  if (fiber.child) collectEffects(fiber.child, effects)
  if (fiber.sibling) collectEffects(fiber.sibling, effects)
}

function updateHostComponent(fiber) {

  let children = []
  if (fiber.props && fiber.props.children) {
    children = fiber.props.children
  }

  if (!fiber.dom)
    fiber.dom = createDom(fiber)

  reconcileChildren(fiber, children)
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

    if (newFiber) {
      if (index === 0) {
        wipFiber.child = newFiber
      } else if (prevSibling) {
        prevSibling.sibling = newFiber
      }

      prevSibling = newFiber
    }

    index++
  }
}
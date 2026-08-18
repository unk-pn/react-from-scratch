import { EffectTags } from './constants'
import { createDom, updateDom } from './dom'
import { runEffects } from './hooks'
import MyReact from '.'
import { state } from './state'
import type {
  Child,
  ComponentFunction,
  Fiber,
  Key,
  MyReactElement,
} from './types'

export function render(element: Child, container: HTMLElement | Text) {
  state.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: state.currentRoot,
  }

  state.deletions = []
  state.nextUnitOfWork = state.wipRoot
}

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false

  while (state.nextUnitOfWork && !shouldYield) {
    state.nextUnitOfWork = performUnitOfWork(state.nextUnitOfWork) ?? null
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!state.nextUnitOfWork && state.wipRoot) commitRoot()

  requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

function performUnitOfWork(fiber: Fiber) {
  const isFunctionComponent = fiber.type instanceof Function
  const isStrictMode = fiber.type === MyReact.StrictMode
  const isFragment = fiber.type === MyReact.Fragment || isStrictMode
  // We are checking for StrictMode bc it doesnt have a dom node
  // (just like Fragment) but we still want to render its children

  if (isStrictMode) {
    fiber.isStrict = true
  }

  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else if (isFragment) {
    updateFragmentComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  if (fiber.child) return fiber.child

  let nextFiber: Fiber | null = fiber
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling

    nextFiber = nextFiber.parent ?? null
  }
}

function updateFunctionComponent(fiber: Fiber) {
  state.wipFiber = fiber
  state.hookIdx = 0
  state.wipFiber.hooks = []

  const componentFn = fiber.type as ComponentFunction

  if (fiber.isStrict) {
    componentFn(fiber.props)

    state.hookIdx = 0
    state.wipFiber.hooks = []
  }

  const children = [componentFn(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateFragmentComponent(fiber: Fiber) {
  let children: MyReactElement[] = []

  if (fiber.props && fiber.props.children) {
    children = fiber.props.children as MyReactElement[]
  }

  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber: Fiber) {
  let children: MyReactElement[] = []
  if (fiber.props && fiber.props.children) {
    children = fiber.props.children as MyReactElement[]
  }

  if (!fiber.dom) fiber.dom = createDom(fiber)

  reconcileChildren(fiber, children)
}

function commitRoot() {
  if (!state.wipRoot || !state.deletions) return

  state.deletions.forEach(commitWork)
  commitWork(state.wipRoot.child ?? null)

  runEffects()

  state.currentRoot = state.wipRoot
  state.wipRoot = null
}

function commitWork(fiber: Fiber | null) {
  if (!fiber) return

  let domParentFiber = fiber.parent
  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }

  if (!domParentFiber || !domParentFiber.dom)
    throw new Error('Cannot find a valid DOM parent')
  const domParent = domParentFiber.dom

  switch (fiber.effectTag) {
    case EffectTags.place:
      if (fiber.dom !== null) {
        domParent.appendChild(fiber.dom as Node)

        if (fiber.props.ref) {
          fiber.props.ref.current = fiber.dom
        }
      }
      break

    case EffectTags.update:
      if (fiber.dom !== null)
        updateDom(fiber.dom as HTMLElement, fiber.alternate!.props, fiber.props)

      if (fiber.props.key) commitPlacement(fiber, domParent)
      break

    case EffectTags.delete:
      commitDeletion(fiber, domParent)
      return
  }

  commitWork(fiber.child ?? null)
  commitWork(fiber.sibling ?? null)
}

function commitDeletion(fiber: Fiber | null, domParent: HTMLElement | Text) {
  if (!fiber) return

  if (fiber.hooks) {
    fiber.hooks.forEach((hook) => {
      if (hook.tag === 'effect' && hook.cleanup) hook.cleanup()
    })
  }

  if (fiber.props.ref) fiber.props.ref.current = null

  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else if (fiber.child) {
    commitDeletion(fiber.child, domParent)
  }

  if (fiber.sibling) {
    commitDeletion(fiber.sibling, domParent)
  }
}

function commitPlacement(fiber: Fiber | null, domParent: HTMLElement | Text) {
  if (!fiber) return

  if (fiber.dom) {
    domParent.appendChild(fiber.dom)
  } else {
    let child = fiber.child
    while (child) {
      commitPlacement(child, domParent)
      child = child.sibling
    }
  }
}

function reconcileChildren(wipFiber: Fiber, elements: MyReactElement[]) {
  const existingChildren = new Map<Key, Fiber>()
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let indexForKey = 0

  while (oldFiber != null) {
    const key = oldFiber.props.key ?? indexForKey
    existingChildren.set(key, oldFiber)
    oldFiber = oldFiber.sibling
    indexForKey++
  }

  let index = 0
  let prevSibling: Fiber | null = null

  while (index < elements.length) {
    const element = elements[index]
    const key = element?.props.key ?? index

    const matchedFiber = existingChildren.get(key)
    let newFiber: Fiber | null = null

    const sameType =
      matchedFiber && element && element.type === matchedFiber.type

    if (sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: matchedFiber!.dom ?? null,
        alternate: matchedFiber ?? null,
        effectTag: EffectTags.update,
        isStrict: wipFiber.isStrict,
      }
      existingChildren.delete(key)
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: null,
        alternate: null,
        effectTag: EffectTags.place,
        isStrict: wipFiber.isStrict,
      }
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

  existingChildren.forEach((fiberToDelete) => {
    fiberToDelete.effectTag = EffectTags.delete
    state.deletions?.push(fiberToDelete)
  })
}

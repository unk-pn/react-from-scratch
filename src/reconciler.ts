import { EffectTags } from "./constants"
import { createDom, updateDom } from "./dom"
import { runEffects } from "./hooks"
import { state } from "./state"
import type { Child, ComponentFunction, Fiber, MyReactElement } from "./types"

export function render(element: Child, container: HTMLElement | Text) {
  state.wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: state.currentRoot,
  }

  state.deletions = []
  state.nextUnitOfWork = state.wipRoot
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

  if (!domParentFiber || !domParentFiber.dom) throw new Error("Cannot find a valid DOM parent");
  const domParent = domParentFiber.dom

  switch (fiber.effectTag) {
    case EffectTags.place:
      if (fiber.dom !== null)
        domParent.appendChild(fiber.dom as Node)
      break

    case EffectTags.update:
      if (fiber.dom !== null)
        updateDom(fiber.dom as HTMLElement, fiber.alternate!.props, fiber.props)
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
    fiber.hooks.forEach(hook => {
      if (hook.tag === "effect" && hook.cleanup) hook.cleanup()
    })
  }

  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else if (fiber.child) {
    commitDeletion(fiber.child, domParent)
  }

  if (fiber.sibling) {
    commitDeletion(fiber.sibling, domParent)
  }
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

  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  if (fiber.child) return fiber.child 

  let nextFiber: Fiber | null = fiber
  while (nextFiber) {
    if (nextFiber.sibling)
      return nextFiber.sibling

    nextFiber = nextFiber.parent ?? null
  }
}

function updateFunctionComponent(fiber: Fiber) {
  state.wipFiber = fiber
  state.hookIdx = 0
  state.wipFiber.hooks = []

  const children = [(fiber.type as ComponentFunction)(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber: Fiber) {
  let children: MyReactElement[] = []
  if (fiber.props && fiber.props.children) {
    children = fiber.props.children as MyReactElement[]
  }

  if (!fiber.dom)
    fiber.dom = createDom(fiber)

  reconcileChildren(fiber, children)
}

function reconcileChildren(wipFiber: Fiber, elements: MyReactElement[]) {
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling: Fiber | null = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber: Fiber | null = null

    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: oldFiber!.dom ?? null,
        alternate: oldFiber ?? null,
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
      state.deletions!.push(oldFiber)
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
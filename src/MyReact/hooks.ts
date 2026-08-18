import { state } from './state'
import type { DependencyArray, EffectHook, Fiber, StateHook } from './types'

// useState
export function useState<T>(
  initial: T
): [T, (action: T | ((state: T) => T)) => void] {
  if (!state.wipFiber)
    throw new Error('Hooks can only be called inside a functional component!')

  const oldHook = (state.wipFiber.alternate &&
    state.wipFiber.alternate.hooks &&
    state.wipFiber.alternate.hooks[state.hookIdx]) as StateHook | undefined

  const hook: StateHook = {
    tag: 'state',
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach((action) => (hook.state = action(hook.state)))

  function setState(action: any) {
    const nextAction = typeof action === 'function' ? action : () => action

    if (!state.currentRoot) throw new Error('No current root fiber found!')

    hook.queue.push(nextAction)
    state.wipRoot = {
      dom: state.currentRoot.dom ?? null,
      props: state.currentRoot.props,
      alternate: state.currentRoot,
    }

    state.nextUnitOfWork = state.wipRoot
    state.deletions = []
  }

  state.wipFiber.hooks!.push(hook)
  state.hookIdx++
  return [hook.state, setState]
}

// useEffect

export function useEffect(
  callback: EffectHook['effect'],
  deps: DependencyArray
) {
  if (!state.wipFiber)
    throw new Error('Hooks can only be called inside a functional component!')

  const oldHook = (state.wipFiber.alternate &&
    state.wipFiber.alternate.hooks &&
    state.wipFiber.alternate.hooks[state.hookIdx]) as EffectHook | undefined

  const oldDeps = oldHook ? oldHook.deps : undefined
  const hasChanged =
    !oldDeps || deps.some((dep, index) => dep !== oldDeps[index])

  const hook: EffectHook = {
    tag: 'effect',
    deps,
    effect: callback,
    cleanup: null,
    hasChanged,
    isStrict: state.wipFiber.isStrict,
  }

  if (hasChanged) {
    hook.cleanup = (oldHook && oldHook.cleanup) ?? null
  }

  if (state.wipFiber.hooks) {
    state.wipFiber.hooks.push(hook)
    state.hookIdx++
  }
}

export function runEffects() {
  const effects: EffectHook[] = []
  collectEffects(state.wipRoot, effects)

  effects.forEach((hook) => {
    if (hook.isStrict) {
      const cleanup = hook.effect()
      if (cleanup) cleanup()
    }

    if (hook.cleanup) hook.cleanup()
    hook.cleanup = hook.effect() ?? null
  })
}

function collectEffects(fiber: Fiber | null, effects: EffectHook[]) {
  if (!fiber) return

  if (fiber.hooks) {
    fiber.hooks.forEach((hook) => {
      if (hook.tag === 'effect' && hook.hasChanged) {
        effects.push(hook)
      }
    })
  }

  if (fiber.child) collectEffects(fiber.child, effects)
  if (fiber.sibling) collectEffects(fiber.sibling, effects)
}

export function useRef<T>(initialValue: T) {
  const [ref] = useState({ current: initialValue })
  return ref
}

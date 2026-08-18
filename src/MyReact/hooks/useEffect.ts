import { state } from '../state'
import type { DependencyArray, EffectHook, Fiber } from '../types'

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

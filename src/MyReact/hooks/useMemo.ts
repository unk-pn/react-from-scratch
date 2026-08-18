import { state } from '../state'
import type { DependencyArray, MemoHook } from '../types'

export function useMemo<T>(factory: () => T, deps: DependencyArray): T {
  if (!state.wipFiber)
    throw new Error('Hooks can only be called inside a functional component!')

  const oldHook = (state.wipFiber.alternate &&
    state.wipFiber.alternate.hooks &&
    state.wipFiber.alternate.hooks[state.hookIdx]) as MemoHook | undefined

  const oldDeps = oldHook ? oldHook.deps : undefined
  const hasChanged =
    !oldDeps || deps.some((dep, index) => dep !== oldDeps[index])

  const hook: MemoHook = {
    tag: 'memo',
    value: hasChanged ? factory() : oldHook!.value,
    deps,
  }

  if (state.wipFiber.hooks) {
    state.wipFiber.hooks.push(hook)
    state.hookIdx++
  }

  return hook.value
}

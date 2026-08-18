import { state } from '../state'
import type { StateHook } from '../types'

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

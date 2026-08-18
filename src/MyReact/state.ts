import type { Fiber } from './types'

interface GlobalState {
  nextUnitOfWork: Fiber | null
  currentRoot: Fiber | null
  wipRoot: Fiber | null
  deletions: Fiber[] | null
  wipFiber: Fiber | null
  hookIdx: number
}

export const state: GlobalState = {
  nextUnitOfWork: null,
  currentRoot: null,
  wipRoot: null,
  deletions: null,
  wipFiber: null,
  hookIdx: 0,
}

import { useMemo } from '.'
import type { DependencyArray } from '../types'

export function useCallback<T extends Function>(
  callback: T,
  deps: DependencyArray
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => callback, deps)
}

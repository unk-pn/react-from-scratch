import { useState } from '.'

export function useRef<T>(initialValue: T) {
  const [ref] = useState({ current: initialValue })
  return ref
}

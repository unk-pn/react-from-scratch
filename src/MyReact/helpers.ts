import type { DependencyArray, Props } from './types'

export const isEvent = (key: string) => key.startsWith('on')

export const isProperty = (key: string) => key !== 'children' && !isEvent(key)

export const isNew = (prev: Props, next: Props) => (key: string) =>
  prev[key] !== next[key]

export const isGone = (_: unknown, next: Props) => (key: string) =>
  !(key in next)

export const isDepsEqual = (
  prevDeps: DependencyArray,
  nextDeps: DependencyArray
) => {
  if (!prevDeps || !nextDeps) return false
  if (prevDeps.length !== nextDeps.length) return false

  for (let i = 0; i < prevDeps.length; i++) {
    if (prevDeps[i] !== nextDeps[i]) return false
  }

  return true
}

export const shallowEqual = (obj1: any, obj2: any) => {
  if (Object.is(obj1, obj2)) return true

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (let i = 0; i < keys1.length; i++) {
    const key = keys1[i] || ''
    if (
      !Object.prototype.hasOwnProperty.call(obj2, key) ||
      !Object.is(obj1[key], obj2[key])
    ) {
      return false
    }
  }

  return true
}

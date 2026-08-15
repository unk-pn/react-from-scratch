import type { DependencyArray, Props } from "./types"

export const isEvent = (key: string) => key.startsWith("on")

export const isProperty = (key: string) => key !== "children" && !isEvent(key)

export const isNew = (prev: Props, next: Props) => (key: string) => prev[key] !== next[key]

export const isGone = (_: unknown, next: Props) => (key: string) => !(key in next)

export const isDepsEqual = (prevDeps: DependencyArray, nextDeps: DependencyArray) => {
  if (!prevDeps || !nextDeps) return false
  if (prevDeps.length !== nextDeps.length) return false

  for (let i = 0; i < prevDeps.length; i++) {
    if (prevDeps[i] !== nextDeps[i]) return false
  }

  return true
}

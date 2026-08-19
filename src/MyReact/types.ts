export type ComponentFunction = {
  (props: any): MyReactElement
  isMemo?: boolean
}
export type ElementType = string | ComponentFunction | Symbol
export type Child =
  MyReactElement | string | number | boolean | null | undefined
export type Key = string | number
export type Ref = { current: any } | null
export type Props = Record<string, unknown> & {
  children?: Child[]
  key?: Key
  ref?: Ref
}

export type EffectTag = 'UPDATE' | 'PLACEMENT' | 'DELETION'

export interface MyReactElement {
  type: ElementType
  props: Props
}

export interface Fiber {
  type?: ElementType
  props: Props
  parent?: Fiber | null
  child?: Fiber | null
  sibling?: Fiber | null
  dom?: HTMLElement | Text | null | undefined
  alternate?: Fiber | null
  effectTag?: EffectTag | undefined
  hooks?: Hook[]
  isStrict?: boolean | undefined
}

export interface StateHook<T = any> {
  tag: 'state'
  state: T
  queue: ((state: T) => T)[]
}

export type DependencyArray = any[]
export interface EffectHook {
  tag: 'effect'
  deps: DependencyArray
  effect: () => (() => void) | void
  cleanup?: null | (() => void)
  hasChanged: boolean
  isStrict?: boolean | undefined
}

export interface MemoHook<T = any> {
  tag: 'memo'
  value: T
  deps: DependencyArray
}

export type Hook = StateHook | EffectHook | MemoHook

declare global {
  namespace JSX {
    interface Element extends MyReactElement {}
    interface IntrinsicElements {
      [elemName: string]: any
    }
    interface IntrinsicAttributes {
      key?: Key
      ref?: { current: any }
    }
  }
}

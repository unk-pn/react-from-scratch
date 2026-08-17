export type ComponentFunction = (props: any) => MyReactElement
export type ElementType = string | ComponentFunction | Symbol;
export type Child = MyReactElement | string | number | boolean | null | undefined;
export type Children = { children?: Child[]; }
export type Key = string | number;
export type KeyedChildren = { key?: Key; }
export type Props = Record<string, unknown> & Children & KeyedChildren;

export type EffectTag = "UPDATE" | "PLACEMENT" | "DELETION";

export interface MyReactElement {
  type: ElementType;
  props: Props;
}

export interface Fiber {
  type?: ElementType;
  props: Props;
  parent?: Fiber | null;
  child?: Fiber | null;
  sibling?: Fiber | null;
  dom?: HTMLElement | Text | null | undefined;
  alternate?: Fiber | null;
  effectTag?: EffectTag;
  hooks?: Hook[];
}

export interface StateHook<T = any> {
  tag: "state";
  state: T;
  queue: ((state: T) => T)[];
}

export type DependencyArray = any[];
export interface EffectHook {
  tag: "effect",
  deps: DependencyArray,
  effect: () => (() => void) | void,
  cleanup?: null | (() => void);
  hasChanged: boolean,
}

export type Hook = StateHook | EffectHook;


declare global {
  namespace JSX {
    interface Element extends MyReactElement {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface IntrinsicAttributes {
      key?: Key;
    }
  }
}
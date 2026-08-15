import { ElementTypes } from "./constants"
import type { Child, ElementType, Props } from "./types"

export function createElement(type: ElementType, props?: Props | null, ...children: Child[]) {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat()
        .filter(child => child !== null && child !== undefined && child !== false)
        .map((child) => 
          typeof child === "object"
            ? child
            : createTextElement(String(child))
        )
    }
  }
}

function createTextElement(text: string) {
  return {
    type: ElementTypes.text,
    props: {
      nodeValue: text,
      children: [],
    }
  }
}
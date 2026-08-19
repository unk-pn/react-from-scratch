import { ElementTypes } from './constants'
import type { Child, ElementType, Props } from './types'

export function createElement(
  type: ElementType,
  props?: Props | null,
  ...children: Child[]
) {
  const finalProps = { ...props }

  // Remove Babel hidden props
  delete finalProps.__source
  delete finalProps.__self

  const newChildren = children
    .flat()
    .filter((child) => child !== null && child !== undefined && child !== false)
    .map((child) =>
      typeof child === 'object' ? child : createTextElement(String(child))
    )

  if (newChildren.length > 0) {
    finalProps.children = newChildren
  }

  return {
    type,
    props: finalProps,
  }
}
function createTextElement(text: string) {
  return {
    type: ElementTypes.text,
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

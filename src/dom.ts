import { ElementTypes } from "./constants"
import { isEvent, isGone, isNew, isProperty } from "./helpers"
import type { Fiber, Props } from "./types"

export function createDom(fiber: Fiber) {
  const props = fiber.props || {}

  const dom = fiber.type === ElementTypes.text 
    ? document.createTextNode("") 
    : document.createElement(fiber.type as string)

  updateDom(dom, {}, props)

  return dom
}

export function updateDom(dom: HTMLElement | Text, prevProps: Props, nextProps: Props) {
  const prev = prevProps || {}
  const next = nextProps || {}

  // Remove old / changed event listeners
  Object.keys(prev)
    .filter(isEvent)
    .filter(key => !(key in next) || isNew(prev, next)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)

      dom.removeEventListener(eventType, prev[name] as EventListener)
    })
  
  // Remove old props
  Object.keys(prev)
    .filter(isProperty)
    .filter(isGone(prev, next))
    .forEach(name => {
      (dom as any)[name] = ""
    })

  // Set new / changed props
  Object.keys(next)
    .filter(isProperty)
    .filter(isNew(prev, next))
    .forEach(name => {
      if (name === "style") {
        const style = (next.style || {}) as Record<string, any>
        Object.keys(next.style || {}).forEach(key => {
          (dom as any).style[key] = style[key]
        })
        return
      }
      (dom as any)[name] = next[name]
    })

  // Set new event listeners
  Object.keys(next)
    .filter(isEvent)
    .filter(isNew(prev, next))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)

      dom.addEventListener(eventType, next[name] as EventListener)
    })
}
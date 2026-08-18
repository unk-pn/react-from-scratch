import { createElement } from './createElement'
import { useState, useEffect } from './hooks'
import { render } from './reconciler'

// We need this bc babel will transpile `<>` to `<MyReact.Fragment>`,
// if we dont have a symbol then `MyReact.Fragment` will be `undefined`
// but in reconciler.ts we have a comparison:
// `const isFragment = fiber.type === MyReact.Fragment`
// and if `fiber.type` will be also be `undefined`
// like if we have a typo or non-existing component
// then the comparison will return `true`
const Fragment = Symbol('FRAGMENT')

const MyReact = {
  createElement,
  render,
  useState,
  useEffect,
  Fragment,
}

export default MyReact

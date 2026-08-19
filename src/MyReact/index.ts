import { createElement } from './createElement'
import { useState, useEffect, useRef, useMemo, useCallback } from './hooks'
import { memo } from './memo'
import { render } from './reconciler'

// We need this bc babel will transpile `<>` to `<MyReact.Fragment>`,
// if we dont have a symbol then `MyReact.Fragment` will be `undefined`
// but in reconciler.ts we have a comparison:
// `const isFragment = fiber.type === MyReact.Fragment`
// and if `fiber.type` will be also be `undefined`
// like if we have a typo or non-existing component
// then the comparison will return `true`
const Fragment = Symbol('FRAGMENT') as any

const StrictMode = Symbol('STRICT_MODE') as any

const MyReact = {
  createElement,
  render,
  useState,
  useEffect,
  Fragment,
  StrictMode,
  useRef,
  useMemo,
  useCallback,
  memo,
}

export default MyReact

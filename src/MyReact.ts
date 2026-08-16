import { createElement } from "./createElement"
import { useState, useEffect } from "./hooks"
import { render } from "./reconciler"

const MyReact = {
  createElement,
  render,
  useState,
  useEffect,
}

export default MyReact
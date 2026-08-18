import { App } from './App'
import MyReact from './MyReact'
const React = MyReact

const element = (
  <MyReact.StrictMode>
    <App />
  </MyReact.StrictMode>
)

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root container not found!')

MyReact.render(element, rootElement)

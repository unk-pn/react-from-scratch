import MyReact from './MyReact';

/** @jsx MyReact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

const container = document.getElementById('root')
MyReact.render(element, container)
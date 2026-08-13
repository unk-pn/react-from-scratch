import MyReact from './MyReact';

// const element = MyReact.createElement(
//   "div",
//   { id: "foo" },
//   React.createElement("a", null, "bar"),
//   React.createElement("b")
// )

/** @jsx MyReact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

const container = document.getElementById('root')
ReactDOM.render(element, container)
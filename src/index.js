import MyReact from './MyReact';

/** @jsx MyReact.createElement */
function App(props) {
  return (
    <div id="foo">
      <h1>Hello from the functional component</h1>
      <div>
        <p>Props: {props.name} </p>
      </div>
    </div>
  )
}
const element = <App name="foo" />
const container = document.getElementById('root')
MyReact.render(element, container)

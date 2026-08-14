import MyReact from './MyReact';

/** @jsx MyReact.createElement */
function App(props) {
  const [count, setCount] = MyReact.useState(0)

  return (
    <div id="foo">
      <h1>Hello from the functional component</h1>
      <div>
        <p>Props: {props.name} </p>
      </div>

      <div>
        <h1>Count: {count}</h1>
        <button onClick={() => setCount(c => c + 1)}>Increment</button>
      </div>
    </div>
  )
}
const element = <App name="foo" />
const container = document.getElementById('root')
MyReact.render(element, container)

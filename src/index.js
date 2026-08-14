import MyReact from './MyReact';

const updateValue = (e) => rerender(e.target.value)

/** @jsx MyReact.createElement */
const container = document.getElementById('root')

const rerender = (value) => {
  const element = (
    <div id="foo">
      <input onInput={updateValue} value={value} />
      <h2>Value: {value}</h2>
    </div>
  )
  MyReact.render(element, container)
}

rerender("")
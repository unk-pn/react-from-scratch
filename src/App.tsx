import { Counter } from './components/Counter'
import { KeysDemo } from './components/Keys'
import { Todos } from './components/Todos'
import MyReact from './MyReact'
const React = MyReact

export function App() {
  const [tab, setTab] = MyReact.useState('counter')

  return (
    <div id="foo">
      <h1>
        Hello from the <b>MyReact</b> functional component!
      </h1>

      <h2>Current Tab: {tab}</h2>

      <>
        <button onClick={() => setTab('counter')}>Counter</button>
        <button onClick={() => setTab('todos')}>Todos</button>
        <button onClick={() => setTab('keys')}>Keys Demo</button>
      </>

      {tab === 'counter' && <Counter />}
      {tab === 'todos' && <Todos />}
      {tab === 'keys' && <KeysDemo />}
    </div>
  )
}

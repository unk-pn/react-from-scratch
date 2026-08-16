import MyReact from './MyReact';
const React = MyReact

function App() {
  const [tab, setTab] = MyReact.useState("counter")
  
  return (
    <div id="foo">
      <h1>Hello from the <b>MyReact</b> functional component!</h1>

      <h2>Current Tab: {tab}</h2>
      <button onClick={() => setTab("counter")}>Counter</button>
      <button onClick={() => setTab("todos")}>Todos</button>
      <button onClick={() => setTab("keys")}>Keys Demo</button>

      {tab === "counter" && <Counter />}
      {tab === "todos" && <Todos />}
      {tab === "keys" && <KeysDemo />}
    </div>
  )
}

function Counter() {
  const [count, setCount] = MyReact.useState(0)

  MyReact.useEffect(() => {
    console.log('Effect ran with count: ', count)

    return () => {
      console.log('Cleanup ran with count: ', count)
    }
  }, [count])

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}

function Todos() {
  const [todos, setTodos] = MyReact.useState<TodoProps[]>([])

  MyReact.useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos?_limit=5")
      .then((response) => response.json())
      .then(setTodos)
      .catch(console.log)
  }, [])

  return (
    <div>
      <h1>Todos</h1>
      {todos.map((todo) => (
        <Todo
          key={todo.id} 
          {...todo}
        />
      ))}
    </div>
  )
}

interface TodoProps {
  userId: number;
  completed: boolean;
  id: number;
  title: string;
}

function Todo({ userId, completed, id, title }: TodoProps) {
  return (
    <div style={{ border: "1px solid black", margin: "5px" }}>
      <h1>{title}</h1>
      <p>{completed ? "Completed" : "Not completed"}</p>
    </div>
  )
}

function KeysDemo() {
  const [items, setItems] = MyReact.useState(["A", "B", "C", "D"])

  const shuffle = () => {
    setItems((prev: string[]) => {
      const newItems = [...prev]
      newItems.sort(() => Math.random() - 0.5)
      return newItems
    })
  }

  return (
    <div>
      <h1>Keys Demo (Shuffle)</h1>
      <button onClick={shuffle}>Shuffle Items!</button>
      <ul>
        {items.map((item) => (
          <ItemWithState key={item} item={item} />
        ))}
      </ul>
    </div>
  )
}

function ItemWithState({ item }: { item: string }) {
  const [clicks, setClicks] = MyReact.useState(0)
  
  return (
    <li style={{ border: "1px solid gray", padding: "5px", margin: "5px" }}>
      Item <b>{item}</b> - Clicks: {clicks}
      <button onClick={() => setClicks(c => c + 1)} style={{ marginLeft: "10px" }}>
        Click me!
      </button>
    </li>
  )
}

const element = <App />
const container = document.getElementById('root')
if (!container) throw new Error("Root container not found!")
MyReact.render(element, container)

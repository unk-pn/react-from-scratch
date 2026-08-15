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

      {tab === "counter" && <Counter />}
      {tab === "todos" && <Todos />}
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
          // key={todo.id} ??? 
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

const element = <App />
const container = document.getElementById('root')
if (!container) throw new Error("Root container not found!")
MyReact.render(element, container)

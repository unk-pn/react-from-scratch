import MyReact from '../MyReact'
const React = MyReact

export function Todos() {
  const [todos, setTodos] = MyReact.useState<TodoProps[]>([])

  MyReact.useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
      .then((response) => response.json())
      .then(setTodos)
      .catch(console.log)
  }, [])

  return (
    <>
      <h1>Todos</h1>
      {todos.map((todo) => (
        <Todo key={todo.id} {...todo} />
      ))}
    </>
  )
}

interface TodoProps {
  userId: number
  completed: boolean
  id: number
  title: string
}

function Todo({ completed, title }: TodoProps) {
  return (
    <div style={{ border: '1px solid black', margin: '5px' }}>
      <h1>{title}</h1>
      <p>{completed ? 'Completed' : 'Not completed'}</p>
    </div>
  )
}

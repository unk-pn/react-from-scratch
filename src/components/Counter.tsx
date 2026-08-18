import MyReact from '../MyReact'
const React = MyReact

export function Counter() {
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
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  )
}

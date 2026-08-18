import MyReact from '../MyReact'
const React = MyReact

export function KeysDemo() {
  const [items, setItems] = MyReact.useState(['A', 'B', 'C', 'D'])

  const shuffle = () => {
    setItems((prev: string[]) => {
      const newItems = [...prev]
      newItems.sort(() => Math.random() - 0.5)
      return newItems
    })
  }

  return (
    <>
      <h1>Keys Demo (Shuffle)</h1>
      <button onClick={shuffle}>Shuffle Items!</button>
      <ul>
        {items.map((item) => (
          <ItemWithState key={item} item={item} />
        ))}
      </ul>
    </>
  )
}

function ItemWithState({ item }: { item: string }) {
  const [clicks, setClicks] = MyReact.useState(0)

  return (
    <li style={{ border: '1px solid gray', padding: '5px', margin: '5px' }}>
      Item <b>{item}</b> - Clicks: {clicks}
      <button
        onClick={() => setClicks((c) => c + 1)}
        style={{ marginLeft: '10px' }}
      >
        Click me!
      </button>
    </li>
  )
}

import MyReact from '../MyReact'
const React = MyReact

// 1. Normal component (renders every time the parent renders)
function ChildNormal({ value }: { value: number }) {
  console.log('🔴 Render ChildNormal')
  return (
    <div style={{ padding: '10px', border: '2px solid red' }}>
      <h3>Normal child</h3>
      <p>Value: {value}</p>
    </div>
  )
}

// 2. Memoized component (renders only if props have changed)
const ChildMemo = MyReact.memo(function ChildMemo({
  value,
  onClick,
}: {
  value: number
  onClick: () => void
}) {
  console.log('🟢 Render: ChildMemo')
  return (
    <div style={{ padding: '10px', border: '2px solid green' }}>
      <h3>Memoized child</h3>
      <p>Value: {value}</p>
      <button onClick={onClick}>Test callback</button>
    </div>
  )
})

export function MemoDemo() {
  console.log('🔵 Render: Parent (MemoDemo)')

  const [count, setCount] = MyReact.useState(0)
  const [text, setText] = MyReact.useState('')

  // 3. Тестируем useMemo (вычисляется ТОЛЬКО когда меняется count)
  const expensiveValue = MyReact.useMemo(() => {
    console.log(
      '   🧠 Вычисление useMemo (должно быть только при изменении count)!'
    )
    return count * 100
  }, [count])

  // 4. Тестируем useCallback (сохраняем ссылку на функцию)
  // Если бы мы не использовали useCallback, эта функция пересоздавалась бы при
  // каждом вводе текста в инпут, и ChildMemo всё равно бы рендерился!
  const handleChildClick = MyReact.useCallback(() => {
    console.log('Кликнули в ChildMemo! Текущий count: ', count)
  }, [count])

  return (
    <div
      style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px' }}
    >
      <h3>Тест оптимизаций (открой консоль!)</h3>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setCount(count + 1)}>
          Увеличить Count ({count})
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          placeholder="Печатай текст..."
          value={text}
          onInput={(e: any) => setText(e.target.value)}
        />
        <p>
          <i>Введенный текст: {text}</i>
        </p>
        <small>
          Если ты печатаешь текст, `count` не меняется. Значит, зеленый ребенок
          НЕ должен рендериться (смотри консоль)!
        </small>
      </div>

      <h4>Результат useMemo: {expensiveValue}</h4>

      <div style={{ display: 'flex', gap: '20px' }}>
        <ChildNormal value={count} />
        <ChildMemo value={count} onClick={handleChildClick} />
      </div>
    </div>
  )
}

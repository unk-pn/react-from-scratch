import type { ComponentFunction, Props } from './types'

export function memo(Component: ComponentFunction) {
  const MemoComponent: ComponentFunction = (props: Props) => Component(props)
  MemoComponent.isMemo = true

  return MemoComponent
}

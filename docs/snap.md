
```js
import { snap } from 'nird'

const [useCount, setCount] = bang(1)
const inc = () => setCount(count => count + 1)

function Counter() {
  const count = useCount()
  return (
    <div>
      <span>{count}</span>
      <button onClick={inc}>one up</button>
    </div>
  )
}
```
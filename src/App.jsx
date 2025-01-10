import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import Box from "./component/Box"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
         <Box />
      </div>
    </>
  )
}

export default App

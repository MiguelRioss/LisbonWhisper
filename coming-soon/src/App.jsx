import { useState } from 'react'
import lisbonWhisperLogo from '/logo.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a  target="">
          <img src={lisbonWhisperLogo} className="logo" alt="Vite logo" />
        </a>
     
      </div>
      <h1>        Coming Soon       </h1>
      <div className="card">
      </div>
    </>
  )
}

export default App

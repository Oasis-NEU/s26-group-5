import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Trade from './trade.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Trade />
  </StrictMode>,
)

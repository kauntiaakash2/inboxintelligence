import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Entry } from './app/Entry'
import './styles/index.css'
const root = document.getElementById('root')
if (!root) throw new Error('Application root is missing')
createRoot(root).render(
  <StrictMode>
    <Entry />
  </StrictMode>,
)

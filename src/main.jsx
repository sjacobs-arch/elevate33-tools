import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BrandAnalysis from './BrandAnalysis'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrandAnalysis />
  </StrictMode>,
)

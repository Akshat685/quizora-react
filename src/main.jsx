import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion, domAnimation } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </LazyMotion>
  </StrictMode>,
)
